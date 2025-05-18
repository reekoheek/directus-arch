import { authentication, createDirectus, realtime, rest, staticToken } from '@directus/sdk';
import { config } from './config.js';

export const directusClient = createDirectus(config.directusUrl)
  .with(
    authentication('json', {
      storage: {
        get() {
          try {
            const sess = JSON.parse(localStorage.getItem('directus_sess') ?? '');
            return sess;
          } catch {
            // noop
          }
        },

        set(value) {
          localStorage.setItem('directus_sess', JSON.stringify(value));
        },
      },
    }),
  )
  .with(rest())
  .with(realtime());

export function createStaticClient() {
  return createDirectus(config.directusUrl).with(staticToken(config.directusStaticToken)).with(rest()).with(realtime());
}
