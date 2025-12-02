import { NextRequest, NextResponse } from 'next/server';
import { getElasticsearchClient } from '@/lib/elasticsearch/client';
import { elasticsearchConfig } from '@/lib/elasticsearch/config';
import { buildAutocompleteQuery } from '@/lib/elasticsearch/queries';
import { AutocompleteResponse } from '@/lib/types/search';
import { Product } from '@/lib/types/product';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        suggestions: [],
        products: [],
      });
    }

    const client = getElasticsearchClient();
    const indexName = elasticsearchConfig.indexName;

    const autocompleteQuery = buildAutocompleteQuery(query.trim());

    const response = await client.search({
      index: indexName,
      body: {
        query: autocompleteQuery,
        size: 5,
        _source: ['id', 'name', 'price', 'imageUrl', 'rating', 'brand'],
      },
    });

    const products: Product[] = response.hits.hits.map((hit: any) => hit._source);

    const suggestions = products
      .map((p) => p.name)
      .filter((name, index, self) => self.indexOf(name) === index)
      .slice(0, 5);

    const autocompleteResponse: AutocompleteResponse = {
      suggestions,
      products,
    };

    return NextResponse.json(autocompleteResponse);
  } catch (error) {
    console.error('Autocomplete error:', error);
    return NextResponse.json(
      {
        error: 'Autocomplete failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
