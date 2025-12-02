import { Client } from '@elastic/elasticsearch';
import { elasticsearchConfig } from './config';

let client: Client | null = null;

export function getElasticsearchClient(): Client {
  if (!client) {
    const config: any = {};

    // For Serverless or direct endpoint with API key
    if (elasticsearchConfig.apiKey) {
      config.node = elasticsearchConfig.node;
      config.auth = {
        apiKey: elasticsearchConfig.apiKey,
      };
    }
    // For Cloud ID
    else if (elasticsearchConfig.cloudId && elasticsearchConfig.apiKey) {
      config.cloud = {
        id: elasticsearchConfig.cloudId,
      };
      config.auth = {
        apiKey: elasticsearchConfig.apiKey,
      };
    }
    // For local development
    else {
      config.node = elasticsearchConfig.node || 'http://localhost:9200';
    }

    client = new Client(config);
  }

  return client;
}

export async function checkElasticsearchHealth(): Promise<boolean> {
  try {
    const client = getElasticsearchClient();
    const health = await client.cluster.health();
    return health.status === 'green' || health.status === 'yellow';
  } catch (error) {
    console.error('Elasticsearch health check failed:', error);
    return false;
  }
}
