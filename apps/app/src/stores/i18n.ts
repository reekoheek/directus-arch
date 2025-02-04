import { I18N, type Translations } from '@lib/i18n/index.js';
import { detectTokenTranslateStrategy } from '@lib/fw/token.js';

const AVAILABLE_LOCALES = ['en', 'id'];
const DEFAULT_LOCALE = AVAILABLE_LOCALES[0];

type ImportFn<T> = () => Promise<{ default: T }>;

const LOADERS: Record<string, ImportFn<Translations>> = {
  id: () => import('./locales/id.js'),
};

function detectLocale() {
  const storedLocale = localStorage.getItem('locale');
  if (storedLocale) {
    return storedLocale;
  }

  for (const lang of navigator.languages) {
    const locale = lang.toLowerCase();
    if (AVAILABLE_LOCALES.includes(locale)) {
      console.info('locale detected:', locale);
      return locale;
    }
  }
  const fallbackLocale = DEFAULT_LOCALE;
  console.info('locale fallback:', fallbackLocale);
  return fallbackLocale;
}

export const i18n = new I18N({
  // debug: true,
  locale: detectLocale(),
  loader: async (locale) => {
    const htmlEl = document.querySelector('html');
    if (!htmlEl) {
      throw new Error('invalid html tag');
    }

    const loader = LOADERS[locale];
    if (!loader) {
      console.warn('locale loader not found,', locale);
      htmlEl.lang = DEFAULT_LOCALE;
      return {};
    }

    htmlEl.lang = locale;

    const loaded = await loader();
    return loaded.default;
  },
});

i18n.setFallbackTranslation({
  $token: detectTokenTranslateStrategy,
});

export async function setLocale(locale: string) {
  await i18n.setLocale(locale);
  localStorage.setItem('locale', locale);
  document.dispatchEvent(new CustomEvent('i18n-locale'));
}

export const t = i18n.createTranslator();
