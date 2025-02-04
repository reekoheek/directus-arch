import type { TranslateStrategy } from '@lib/i18n/I18N.js';

export const detectTokenTranslateStrategy: TranslateStrategy = (data) => {
  if (typeof data !== 'string') {
    throw new Error('invalid token to translate');
  }

  const words = data.split(/[_.]+/);
  return words.map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

export function createTokenTranslateStrategy(tokens: Record<string, string>): TranslateStrategy {
  return (data) => {
    if (typeof data !== 'string') {
      throw new Error('invalid token to translate');
    }

    if (!tokens[data]) {
      console.warn('no token translator', data);
      return `$token:${data}`;
    }

    return tokens[data];
  };
}
