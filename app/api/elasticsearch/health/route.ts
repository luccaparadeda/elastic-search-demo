import { NextResponse } from 'next/server';
import { getElasticsearchClient, checkElasticsearchHealth } from '@/lib/elasticsearch/client';

export async function GET() {
  try {
    const client = getElasticsearchClient();
    const isHealthy = await checkElasticsearchHealth();

    if (!isHealthy) {
      return NextResponse.json(
        {
          status: 'unhealthy',
          message: 'Elasticsearch cluster is not healthy',
        },
        { status: 503 }
      );
    }

    const info = await client.info();

    return NextResponse.json({
      status: 'healthy',
      info: {
        name: info.name,
        version: info.version.number,
        clusterName: info.cluster_name,
      },
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
