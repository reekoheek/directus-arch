import type { BiostarRequest } from '../BiostarRequest.js';

export function deleteUser(id: string): BiostarRequest {
  return {
    method: 'DELETE',
    url: `/users?id=${id}`,
  };
}
