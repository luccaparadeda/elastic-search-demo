import { z } from 'zod';

const envSchema = z.object({
  ELASTICSEARCH_NODE: z.string().url().optional(),
  ELASTICSEARCH_INDEX_NAME: z.string(),
  ELASTICSEARCH_CLOUD_ID: z.string().optional(),
  ELASTICSEARCH_API_KEY: z.string().optional(),
});

function getElasticsearchConfig() {
  const env = envSchema.parse({
    ELASTICSEARCH_NODE: process.env.ELASTICSEARCH_NODE,
    ELASTICSEARCH_INDEX_NAME: process.env.ELASTICSEARCH_INDEX_NAME,
    ELASTICSEARCH_CLOUD_ID: process.env.ELASTICSEARCH_CLOUD_ID,
    ELASTICSEARCH_API_KEY: process.env.ELASTICSEARCH_API_KEY,
  });

  return {
    node: env.ELASTICSEARCH_NODE,
    indexName: env.ELASTICSEARCH_INDEX_NAME,
    cloudId: env.ELASTICSEARCH_CLOUD_ID,
    apiKey: env.ELASTICSEARCH_API_KEY,
  };
}

export const elasticsearchConfig = getElasticsearchConfig();
