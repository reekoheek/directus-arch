import { defineHook } from '@directus/extensions';

export const testHook = defineHook((_hooks, _ctx) => {
  console.info('put your business process here');
});
