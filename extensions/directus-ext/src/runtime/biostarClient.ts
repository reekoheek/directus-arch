import { BiostarClient } from '../lib/biostar2/BiostarClient.js';
import { createStore } from '../lib/directus/createStore.js';

export const BIOSTAR_HOST = process.env.APP_BIOSTAR_HOST ?? 'localhost';
export const BIOSTAR_LOGINID = process.env.APP_BIOSTAR_LOGINID ?? 'admin';
export const BIOSTAR_PASSWORD = process.env.APP_BIOSTAR_PASSWORD ?? '';

export const lookupBiostarClient = createStore(
  'biostarClient',
  async () => {
    console.info('BIOSTAR_HOST', BIOSTAR_HOST);

    const client = new BiostarClient({
      host: BIOSTAR_HOST,
      loginId: BIOSTAR_LOGINID,
      password: BIOSTAR_PASSWORD,
      rejectUnauthorized: false,
    });

    await client.connect();

    return client;
  },
  async (promisedClient) => {
    const client = await promisedClient;
    client.disconnect();
  },
);
