import { defineEndpoint } from '@directus/extensions-sdk';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export default defineEndpoint({
  id: 'ext',
  handler: (router, _ctx) => {
    router.get('/check', (rctx, res) => {
      const redirect = rctx.query.redirect as string;
      if (!redirect) {
        res.send({});
        return;
      }

      res.redirect(redirect);
    });
  },
});
