import { Toast } from '@lib/components/Toast.js';
import type { Middleware } from '../Router.js';

export function toast(message = 'Opening page...'): Middleware {
  return async (ctx, next) => {
    const toast = Toast.open(message, { variant: 'secondary' });
    try {
      await next();
    } finally {
      toast.close();
    }
  };
}
