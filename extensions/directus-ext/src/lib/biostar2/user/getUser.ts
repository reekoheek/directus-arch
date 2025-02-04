import type { BiostarRequest } from '../BiostarRequest.js';

export function getUser(userId: string): BiostarRequest {
  return {
    method: 'GET',
    url: `/users/${userId}`,
    mapResult: async (resp) => {
      const result = await resp.json();
      return result.User;
    },
  };
}
