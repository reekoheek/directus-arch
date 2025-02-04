import type { RouteFn } from '../Router.js';

type LoadFn = () => Promise<unknown>;

type Props = Record<string, unknown>;

type PropsFactory = () => Promise<Props> | Props;

export function element(tagName: string, load: LoadFn, props?: Props | PropsFactory): RouteFn {
  return async () => {
    await load();

    const el = document.createElement(tagName);
    const propsToAssign = typeof props === 'function' ? await props() : props;
    if (propsToAssign) {
      Object.assign(el, propsToAssign);
    }

    return el;
  };
}
