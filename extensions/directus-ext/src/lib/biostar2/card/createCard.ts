import { BiostarError } from '../BiostarError.js';
import type { BiostarRequest } from '../BiostarRequest.js';

export type CardType = 'csn' | 'qr';

export function createCard(cardNo: string, cardType: CardType = 'csn'): BiostarRequest {
  return {
    method: 'POST',
    url: '/cards',
    body: {
      CardCollection: {
        rows: [
          {
            card_type: mapCardType(cardType),
            card_id: cardNo,
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

function mapCardType(cardType: CardType) {
  switch (cardType) {
    case 'csn':
      return { id: '0', type: '1' };
    case 'qr':
      return { id: '6', type: '6' };
    default:
      throw new BiostarError('undefined card type');
  }
}
