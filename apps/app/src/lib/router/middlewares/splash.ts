import type { Middleware } from '../Router.js';

const DEFAULT_DELAY = 300;

interface SplashOpts {
  el?: HTMLElement;
  delay?: number;
}

export function splash(opts?: SplashOpts): Middleware {
  const splashEl = opts?.el ?? document.getElementById('splashCover') ?? undefined;
  if (!splashEl) {
    throw new Error('no splash cover');
  }

  let firstTime = true;

  return async (ctx, next) => {
    await next();

    if (!ctx.element || !firstTime) {
      return;
    }

    firstTime = false;

    setTimeout(() => splashEl.parentElement?.removeChild(splashEl), opts?.delay ?? DEFAULT_DELAY);
  };
}
