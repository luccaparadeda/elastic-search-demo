import { SearchFilters, SearchSort } from '../types/search';

export function buildSearchQuery(query: string, filters?: SearchFilters) {
  const must: any[] = [];
  const filter: any[] = [];

  if (query && query.trim()) {
    must.push({
      multi_match: {
        query: query.trim(),
        fields: ['name^3', 'description', 'brand^2', 'tags'],
        fuzziness: 'AUTO',
        prefix_length: 2,
        operator: 'or',
      },
    });
  }

  if (filters?.categories && filters.categories.length > 0) {
    filter.push({
      terms: { category: filters.categories },
    });
  }

  if (filters?.brands && filters.brands.length > 0) {
    filter.push({
      terms: { brand: filters.brands },
    });
  }

  if (filters?.priceRange) {
    const priceFilter: any = { range: { price: {} } };
    if (filters.priceRange.min !== undefined) {
      priceFilter.range.price.gte = filters.priceRange.min;
    }
    if (filters.priceRange.max !== undefined) {
      priceFilter.range.price.lte = filters.priceRange.max;
    }
    filter.push(priceFilter);
  }

  if (filters?.rating !== undefined) {
    filter.push({
      range: { rating: { gte: filters.rating } },
    });
  }

  if (filters?.inStock) {
    filter.push({
      term: { inStock: true },
    });
  }

  if (filters?.tags && filters.tags.length > 0) {
    filter.push({
      terms: { tags: filters.tags },
    });
  }

  const boolQuery: any = {};
  if (must.length > 0) boolQuery.must = must;
  if (filter.length > 0) boolQuery.filter = filter;

  if (Object.keys(boolQuery).length === 0) {
    return { match_all: {} };
  }

  return { bool: boolQuery };
}

export function buildAggregations() {
  return {
    categories: {
      terms: { field: 'category', size: 50 },
    },
    brands: {
      terms: { field: 'brand', size: 50 },
    },
    price_stats: {
      stats: { field: 'price' },
    },
    avg_rating: {
      avg: { field: 'rating' },
    },
  };
}

export function buildHighlightConfig() {
  return {
    fields: {
      name: {
        pre_tags: ['<mark>'],
        post_tags: ['</mark>'],
        number_of_fragments: 0,
      },
      description: {
        pre_tags: ['<mark>'],
        post_tags: ['</mark>'],
        fragment_size: 150,
        number_of_fragments: 1,
      },
    },
  };
}

export function buildSortConfig(sort?: SearchSort) {
  if (!sort || sort.field === '_score') {
    return [{ _score: { order: 'desc' } }];
  }

  const sortConfig: any = { [sort.field]: { order: sort.order } };

  if (sort.field === 'rating') {
    return [sortConfig, { reviewCount: { order: 'desc' } }];
  }

  return [sortConfig];
}

export function buildAutocompleteQuery(query: string) {
  return {
    bool: {
      should: [
        {
          match: {
            name: {
              query,
              analyzer: 'autocomplete_search_analyzer',
              boost: 3,
            },
          },
        },
        {
          match_phrase_prefix: {
            name: {
              query,
              boost: 2,
            },
          },
        },
        {
          match: {
            brand: {
              query,
              boost: 1.5,
            },
          },
        },
      ],
    },
  };
}
