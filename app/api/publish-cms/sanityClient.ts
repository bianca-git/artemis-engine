import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID!,
  dataset: process.env.SANITY_DATASET!,
  apiVersion: process.env.SANITY_API_VERSION || '2023-05-03',
  token: process.env.SANITY_API_TOKEN!,
  useCdn: false,
});

export default client;
