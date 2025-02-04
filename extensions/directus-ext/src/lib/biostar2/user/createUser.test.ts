import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createTestClient } from '../testUtils.js';
import { createUser } from './createUser.js';
import type { BiostarClient } from '../BiostarClient.js';

const USER_ID = '123456';

describe.skip('createUser()', () => {
  let client: BiostarClient;

  beforeEach(async () => {
    client = await createTestClient();
    await mustDeleteUser(client, USER_ID);
  });

  afterEach(async () => {
    await mustDeleteUser(client, USER_ID);
    client = await createTestClient();
  });

  it('create new user', async () => {
    await client.request(
      createUser({
        id: USER_ID,
        groupId: '1023',
        accessGroupId: '1',
        name: 'foo',
        startTime: new Date('2024-11-21T09:00:00+0700'),
        expiryTime: new Date('2024-11-21T11:00:00+0700'),
      }),
    );

    expect(await hasUser(client, USER_ID));
  });
});

async function mustDeleteUser(client: BiostarClient, userId: string) {
  try {
    await client.request({
      method: 'DELETE',
      url: `/users?id=${userId}`,
    });
  } catch {
    // noop
  }
}

async function hasUser(client: BiostarClient, userId: string) {
  try {
    await client.request({
      method: 'GET',
      url: `/users/${userId}`,
    });
    return true;
  } catch {
    return false;
  }
}
