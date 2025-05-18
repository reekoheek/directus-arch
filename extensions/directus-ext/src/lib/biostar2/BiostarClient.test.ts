import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BiostarClient } from './BiostarClient.js';
import { BIOSTAR_HOST, BIOSTAR_LOGINID, BIOSTAR_PASSWORD, createTestClient } from './testUtils.js';
import { BiostarError } from './BiostarError.js';

describe.skip('BiostarClient', () => {
  describe('#login()', () => {
    it('login', async () => {
      const client = new BiostarClient({
        host: BIOSTAR_HOST,
        loginId: BIOSTAR_LOGINID,
        password: BIOSTAR_PASSWORD,
        rejectUnauthorized: false,
      });
      try {
        await client.connect();
        expect(client.connected).toStrictEqual(true);
      } finally {
        try {
          await client.disconnect();
        } catch {}
      }
    });
  });

  describe('#request()', () => {
    let client: BiostarClient;

    beforeEach(async () => {
      client = await createTestClient();
    });

    afterEach(async () => {
      try {
        await client.disconnect();
      } catch {}
    });

    it('request to api', async () => {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const resp: Record<string, any> = await client.request({
        method: 'GET',
        url: '/users/1',
      });
      expect(resp.User.user_id).toStrictEqual('1');
    });

    it('map result', async () => {
      const resp = await client.request({
        method: 'GET',
        url: '/users/1',
        mapResult: async (resp) => {
          const data = await resp.json();
          return data.User;
        },
      });
      expect(resp.user_id).toStrictEqual('1');
    });

    it('map error', async () => {
      try {
        await client.request({
          method: 'GET',
          url: '/notfound',
          mapError: () => new BiostarError('ouch'),
        });
      } catch (err) {
        expect((err as Error).message).toStrictEqual('ouch');
      }
    });
  });
});
