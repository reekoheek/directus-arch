import { BiostarClient } from './BiostarClient.js';

export const BIOSTAR_HOST = process.env.BIOSTAR_HOST ?? 'localhost';
export const BIOSTAR_LOGINID = process.env.BIOSTAR_LOGINID ?? 'admin';
export const BIOSTAR_PASSWORD = process.env.BIOSTAR_PASSWORD ?? '';

export async function createTestClient() {
  const client = new BiostarClient({
    host: BIOSTAR_HOST,
    loginId: BIOSTAR_LOGINID,
    password: BIOSTAR_PASSWORD,
    rejectUnauthorized: false,
  });
  await client.connect();
  return client;
}
