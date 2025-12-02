export const PRODUCT_INDEX_MAPPING = {
  settings: {
    analysis: {
      analyzer: {
        autocomplete_analyzer: {
          type: 'custom',
          tokenizer: 'standard',
          filter: ['lowercase', 'autocomplete_filter'],
        },
        autocomplete_search_analyzer: {
          type: 'custom',
          tokenizer: 'standard',
          filter: ['lowercase'],
        },
      },
      filter: {
        autocomplete_filter: {
          type: 'edge_ngram',
          min_gram: 2,
          max_gram: 20,
        },
      },
    },
  },
  mappings: {
    properties: {
      id: { type: 'keyword' },
      name: {
        type: 'text',
        analyzer: 'autocomplete_analyzer',
        search_analyzer: 'autocomplete_search_analyzer',
        fields: {
          keyword: { type: 'keyword' },
        },
      },
      description: {
        type: 'text',
        analyzer: 'standard',
      },
      brand: {
        type: 'keyword',
        fields: {
          text: { type: 'text' },
        },
      },
      category: { type: 'keyword' },
      subcategory: { type: 'keyword' },
      price: { type: 'float' },
      originalPrice: { type: 'float' },
      discount: { type: 'integer' },
      rating: { type: 'float' },
      reviewCount: { type: 'integer' },
      imageUrl: { type: 'keyword', index: false },
      images: { type: 'keyword', index: false },
      inStock: { type: 'boolean' },
      stockCount: { type: 'integer' },
      tags: { type: 'keyword' },
      features: { type: 'text' },
      specifications: { type: 'object', enabled: false },
      color: { type: 'keyword' },
      size: { type: 'keyword' },
      createdAt: { type: 'date' },
      updatedAt: { type: 'date' },
    },
  },
};
