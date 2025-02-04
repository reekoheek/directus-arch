import { defineHook } from '@directus/extensions-sdk';
import { testHook } from './features/testHook.js';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export default defineHook(async (hooks, ctx) => {
  testHook(hooks, ctx);
});
