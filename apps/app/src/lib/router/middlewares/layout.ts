import type { Middleware } from '../Router.js';

interface PageWithLayout extends HTMLElement {
  pageLayout?: string;
}

export function layout(): Middleware {
  return async (ctx, next) => {
    await next();

    if (!ctx.element) {
      return;
    }

    const layout = (ctx.element as PageWithLayout).pageLayout ?? 'default';
    document.body.setAttribute('layout', layout);
  };
}
