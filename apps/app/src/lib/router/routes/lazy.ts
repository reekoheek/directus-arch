import type { RouteFn } from '../Router.js';

type LoadFn = () => Promise<unknown>;

export function lazy(load: LoadFn): RouteFn {
  return async () => {
    const mod = await load();
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const ElementCtr = (mod as any)[Object.keys(mod as object)[0]];
    if (typeof ElementCtr !== 'function') {
      throw new Error('invalid lazy element');
    }

    return new ElementCtr();
  };
}
