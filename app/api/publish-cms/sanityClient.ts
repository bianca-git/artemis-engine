import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID || 'dummy-project',
  dataset: process.env.SANITY_DATASET || 'production',
  apiVersion: process.env.SANITY_API_VERSION || '2023-01-01',
  token: process.env.SANITY_API_TOKEN || 'dummy-token',
  useCdn: false,
});

export default client;
