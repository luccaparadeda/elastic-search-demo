import { NextRequest, NextResponse } from 'next/server';
import { getElasticsearchClient } from '@/lib/elasticsearch/client';
import { elasticsearchConfig } from '@/lib/elasticsearch/config';
import {
  buildSearchQuery,
  buildAggregations,
  buildHighlightConfig,
  buildSortConfig,
} from '@/lib/elasticsearch/queries';
import { SearchRequest, SearchResponse } from '@/lib/types/search';
import { ProductWithHighlight } from '@/lib/types/product';

export async function POST(request: NextRequest) {
  try {
    const body: SearchRequest = await request.json();
    const { query, filters, sort, page = 1, pageSize = 12 } = body;

    const client = getElasticsearchClient();
    const indexName = elasticsearchConfig.indexName;

    const searchQuery = buildSearchQuery(query, filters);
    const aggregations = buildAggregations();
    const highlight = buildHighlightConfig();
    const sortConfig = buildSortConfig(sort);

    const from = (page - 1) * pageSize;

    const response = await client.search({
      index: indexName,
      query: searchQuery,
      aggs: aggregations,
      highlight,
      sort: sortConfig,
      from,
      size: pageSize,
      track_total_hits: true,
    });

    const hits: ProductWithHighlight[] = response.hits.hits.map((hit: any) => {
      const product = hit._source;
      if (hit.highlight) {
        product.highlight = {
          name: hit.highlight.name,
          description: hit.highlight.description,
        };
      }
      return product;
    });

    const total = typeof response.hits.total === 'number'
      ? response.hits.total
      : response.hits.total?.value || 0;

    const aggs = response.aggregations as any;

    const searchResponse: SearchResponse = {
      hits,
      total,
      took: response.took,
      aggregations: {
        categories: aggs.categories?.buckets?.map((b: any) => ({
          key: b.key,
          count: b.doc_count,
        })) || [],
        brands: aggs.brands?.buckets?.map((b: any) => ({
          key: b.key,
          count: b.doc_count,
        })) || [],
        priceRange: {
          min: aggs.price_stats?.min || 0,
          max: aggs.price_stats?.max || 0,
        },
        avgRating: aggs.avg_rating?.value || 0,
      },
    };

    return NextResponse.json(searchResponse);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      {
        error: 'Search failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
