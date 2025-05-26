import { addStyle } from '@lib/style/index.js';
import { config, putConfig } from './runtime/config.js';
import { bypassHttps } from '@lib/bypass-https/bypassHttps.js';

(async () => {
  await putConfig();

  await bypassHttps(`${config.directusUrl}/ext/check`);

  const styles = (
    await Promise.all([
      import('bootstrap/dist/css/bootstrap.min.css?inline'),
      import('bootstrap-icons/font/bootstrap-icons.min.css?inline'),
      import('./index.css?inline'),
    ])
  ).map((imported) => imported.default);
  addStyle(...styles);

  const { i18n } = await import('./runtime/i18n.js');
  await i18n.load();
  const { router } = await import('./runtime/router.js');
  await router.load();

  await import('./features/common/App.js');
})();
