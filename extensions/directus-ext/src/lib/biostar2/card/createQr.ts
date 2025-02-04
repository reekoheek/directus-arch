import type { BiostarRequest } from '../BiostarRequest.js';

export function createQr(cardId: string): BiostarRequest {
  return {
    method: 'POST',
    url: '/cards',
    body: {
      CardCollection: {
        rows: [
          {
            card_type: {
              id: '6',
              type: '6',
            },
            card_id: cardId,
          },
        ],
      },
    },
    mapResult: async (resp) => {
      const result = await resp.json();
      return result.CardCollection.rows[0];
    },
  };
}
