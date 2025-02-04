import type { Middleware } from '@lib/router/Router.js';
import { UnauthorizedError } from './UnauthorizedError.js';
import type { Auth } from './Auth.js';

export type IgnoreCallback = (path: string) => boolean;

const DEFAULT_IGNORE_CALLBACK: IgnoreCallback = (path) => {
  if (path === '/login') return true;
  if (path === '/chgpwd') return true;
  if (path.startsWith('/pub/')) return true;
  return false;
};

interface AuthenticateOpts {
  ignore?: IgnoreCallback;
  redirectUnauthorized?: string;
}

export function authenticate(auth: Auth, opts?: AuthenticateOpts): Middleware {
  const ignore = opts?.ignore ?? DEFAULT_IGNORE_CALLBACK;
  const redirectUnauthorized = opts?.redirectUnauthorized ?? '/login';

  return async (ctx, next) => {
    if (ignore(ctx.path)) {
      await next();
      return;
    }

    try {
      await auth.authenticate();
      await next();
    } catch (err) {
      console.error('authenticate err', err);

      if (err instanceof UnauthorizedError) {
        let redirectTo = redirectUnauthorized;
        if (ctx.path !== '/') {
          redirectTo += `?redirect=${ctx.path}`;
        }
        ctx.router.replace(redirectTo);
        return;
      }
      throw err;
    }
  };
}
