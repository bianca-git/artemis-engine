import { createClient } from '@sanity/client';

const { SANITY_PROJECT_ID, SANITY_DATASET, SANITY_API_TOKEN, SANITY_API_VERSION } = process.env;

const client =
  SANITY_PROJECT_ID && SANITY_DATASET && SANITY_API_TOKEN
    ? createClient({
        projectId: SANITY_PROJECT_ID,
        dataset: SANITY_DATASET,
        apiVersion: SANITY_API_VERSION || '2023-05-03',
        token: SANITY_API_TOKEN,
        useCdn: false,
      })
    : null;

export default client;
