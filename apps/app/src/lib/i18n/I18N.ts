export type Translator = (message: string, data?: unknown) => string;

export type TranslateStrategy = (data?: unknown) => string;

export interface Translation {
  [k: string]: string | TranslateStrategy;
}

export interface Translations {
  [k: string]: Translation;
}

export type Loader = (locale: string) => Translations | Promise<Translations>;

export interface I18NOpts {
  locale?: string;
  loader: Loader;
  debug?: boolean;
}

export class I18N {
  private readonly loader: Loader;
  private readonly debug: boolean;
  private locale: string;
  private fallbackTranslation: Translation = {};
  private translations?: Translations;

  constructor(opts: I18NOpts) {
    this.locale = opts.locale ?? 'en';
    this.loader = opts.loader;
    this.debug = opts.debug ?? false;
  }

  async load() {
    this.translations = await this.loader(this.locale);
    if (this.debug) console.info('translation loaded with locale', this.locale);
  }

  async setLocale(locale: string) {
    this.locale = locale;
    await this.load();
  }

  setFallbackTranslation(translation: Translation) {
    this.fallbackTranslation = translation;
  }

  createTranslator(ns = '$'): Translator {
    return (message, data) => {
      const translations = this.translations;

      if (!translations) {
        throw new Error('unloaded translations');
      }

      const translation = translations[ns];
      if (translation?.[message]) {
        return translate(translation[message], data);
      }

      const commonTranslation = translations.$;
      if (commonTranslation?.[message]) {
        return translate(commonTranslation[message], data);
      }

      if (this.debug) console.warn('no translator [%s][%s]', ns, message);

      if (this.fallbackTranslation?.[message]) {
        return translate(this.fallbackTranslation?.[message], data);
      }

      return translate(message, data);
    };
  }
}

function translate(translator: TranslateStrategy | string, data?: unknown) {
  if (typeof translator === 'function') {
    return translator(data);
  }

  return translateString(translator, data);
}

function translateString(message: string, data?: unknown) {
  if (data === undefined || data === null) {
    return message;
  }

  if (message.includes('{}')) {
    return message.replace('{}', data as string);
  }

  if (typeof data !== 'object') {
    throw new Error('invalid data to translate');
  }

  return message.replace(/{(\w+)}/g, (_, key) => (data as Record<string, string>)[key] ?? '');
}
