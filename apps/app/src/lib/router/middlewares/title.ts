import type { Middleware } from '../Router.js';

type FormatFn = (title?: string) => string;

interface TitledElement extends HTMLElement {
  pageTitle?: string;
}

const DEFAULT_FORMAT: FormatFn = (title) => title ?? '';

export function title(format: FormatFn = DEFAULT_FORMAT, delay = 100): Middleware {
  return async (ctx, next) => {
    await next();

    setTitle(format, delay, ctx.element);
  };
}

function setTitle(format: FormatFn, delay: number, htmlEl?: HTMLElement) {
  const el = htmlEl as TitledElement;

  const setTitle = () => {
    document.title = format(
      el?.pageTitle ?? el?.querySelector('h1, h2, h3, h4, h5')?.textContent ?? el?.constructor.name ?? '404',
    );
  };

  setTimeout(setTitle, delay);
}
