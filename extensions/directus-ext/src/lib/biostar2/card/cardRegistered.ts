import type { BiostarRequest } from '../BiostarRequest.js';

export function cardRegistered(cardId: string): BiostarRequest {
  return {
    method: 'GET',
    url: `/v2/cards/registered/?card_id=${cardId}`,
    mapResult: async (resp) => {
      const result = await resp.json();
      if (result.Card) {
        return true;
      }
      return false;
    },
  };
}
