import { NextResponse } from 'next/server';
import { getElasticsearchClient } from '@/lib/elasticsearch/client';
import { elasticsearchConfig } from '@/lib/elasticsearch/config';
import { PRODUCT_INDEX_MAPPING } from '@/lib/elasticsearch/index-mapping';
import { generateSeedData } from '@/lib/elasticsearch/seed-data';

export async function POST() {
  try {
    const client = getElasticsearchClient();
    const indexName = elasticsearchConfig.indexName;

    const indexExists = await client.indices.exists({ index: indexName });

    if (indexExists) {
      await client.indices.delete({ index: indexName });
      console.log(`Deleted existing index: ${indexName}`);
    }

    await client.indices.create({
      index: indexName,
      body: PRODUCT_INDEX_MAPPING,
    });
    console.log(`Created index: ${indexName}`);

    const products = generateSeedData(150);

    const bulkBody = products.flatMap((product) => [
      { index: { _index: indexName, _id: product.id } },
      product,
    ]);

    const bulkResponse = await client.bulk({
      body: bulkBody,
      refresh: 'wait_for',
    });

    if (bulkResponse.errors) {
      const erroredDocuments: any[] = [];
      bulkResponse.items.forEach((action: any, i: number) => {
        const operation = Object.keys(action)[0];
        if (action[operation].error) {
          erroredDocuments.push({
            status: action[operation].status,
            error: action[operation].error,
            document: products[i],
          });
        }
      });
      console.error('Bulk indexing errors:', erroredDocuments);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${products.length} products`,
      count: products.length,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to seed data',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
