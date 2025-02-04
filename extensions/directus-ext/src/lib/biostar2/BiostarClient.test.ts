import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BiostarClient } from './BiostarClient.js';
import { BIOSTAR_HOST, BIOSTAR_LOGINID, BIOSTAR_PASSWORD, createTestClient } from './testUtils.js';
import { BiostarError } from './BiostarError.js';

describe.skip('BiostarClient', () => {
  describe('#login()', () => {
    it('login', async () => {
      const client = new BiostarClient({
        host: BIOSTAR_HOST,
        rejectUnauthorized: false,
      });
      try {
        await client.login(BIOSTAR_LOGINID, BIOSTAR_PASSWORD);
        expect(client.loggedIn).toStrictEqual(true);
      } finally {
        try {
          await client.logout();
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
        await client.logout();
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

  describe('#subscribe()', () => {
    it('subscribe event', async () => {
      const client = await createTestClient();

      try {
        const unsubscribe = client.subscribe(() => {});

        expect(client.subscribers.length).toStrictEqual(1);

        await new Promise((resolve) => setTimeout(resolve, 500));

        unsubscribe();

        expect(client.subscribers.length).toStrictEqual(0);
      } finally {
        try {
          await client.logout();
        } catch {}
      }
    }, 100000);
  });
});
