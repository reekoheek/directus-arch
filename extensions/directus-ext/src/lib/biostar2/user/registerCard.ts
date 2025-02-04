import type { BiostarRequest } from '../BiostarRequest.js';

export function registerCard(userId: string, cardId: string): BiostarRequest {
  const body = {
    User: {
      cards: [
        {
          id: cardId,
        },
      ],
    },
  };

  return {
    method: 'PUT',
    url: `/users/${userId}`,
    body,
  };
}
