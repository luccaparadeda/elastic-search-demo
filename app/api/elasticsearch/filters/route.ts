import { NextResponse } from 'next/server';
import { getElasticsearchClient } from '@/lib/elasticsearch/client';
import { elasticsearchConfig } from '@/lib/elasticsearch/config';
import { AvailableFilters } from '@/lib/types/filters';

export async function GET() {
  try {
    const client = getElasticsearchClient();
    const indexName = elasticsearchConfig.indexName;

    const response = await client.search({
      index: indexName,
      body: {
        size: 0,
        aggs: {
          categories: {
            terms: { field: 'category', size: 50 },
          },
          brands: {
            terms: { field: 'brand', size: 100 },
          },
          tags: {
            terms: { field: 'tags', size: 50 },
          },
          price_stats: {
            stats: { field: 'price' },
          },
        },
      },
    });

    const aggs = response.aggregations as any;

    const filters: AvailableFilters = {
      categories: aggs.categories?.buckets?.map((b: any) => b.key) || [],
      brands: aggs.brands?.buckets?.map((b: any) => b.key) || [],
      tags: aggs.tags?.buckets?.map((b: any) => b.key) || [],
      priceRange: {
        min: aggs.price_stats?.min || 0,
        max: aggs.price_stats?.max || 0,
      },
    };

    return NextResponse.json(filters);
  } catch (error) {
    console.error('Filters error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch filters',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
