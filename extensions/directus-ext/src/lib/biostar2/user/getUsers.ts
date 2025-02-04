import type { BiostarRequest } from '../BiostarRequest.js';

export interface CreateUserParam {
  groupId?: string;
  limit?: number;
  offset?: number;
}

export function getUsers(param?: CreateUserParam): BiostarRequest {
  const queryArr: string[] = [];

  if (param?.groupId !== undefined) {
    queryArr.push(`group_id=${param.groupId}`);
  }

  if (param?.limit !== undefined) {
    queryArr.push(`limit=${param.limit}`);
  }

  if (param?.offset !== undefined) {
    queryArr.push(`offset=${param.offset}`);
  }

  return {
    method: 'GET',
    url: `/users?${queryArr.join('&')}`,
    mapResult: async (resp) => {
      const result = await resp.json();
      return result.UserCollection.rows;
    },
  };
}
