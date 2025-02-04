export interface Context {
  router: Router;
  originalPath: string;
  path: string;
  params: Record<string, string>;
  query: Record<string, string>;
  segments: string[];
  state: Record<string, unknown>;
  routeId?: number;
  element?: HTMLElement;
}

export type RouteFn<T extends HTMLElement = HTMLElement> = (ctx: Context) => T | Promise<T>;

class Route {
  private readonly pattern: RegExp;

  constructor(
    readonly path: string,
    readonly fn: RouteFn,
  ) {
    const cleanPath = path.replace(/\/$/g, '') || '/';
    const pattern = cleanPath
      .replace(/[\s!#$()+,.:<=?[\\\]^{|}]/g, '\\$&')
      .replace(/\/\\:(\w+)\\\?/g, '(?:/(?<$1>(?<=/)[^/]+))?')
      .replace(/\/\\:(\w+)/g, '/(?<$1>[^/]+)');
    this.pattern = RegExp(`^${pattern}$`, 'i');
  }

  matchPath(path: string) {
    const matches = this.pattern.exec(path);
    return matches;
  }

  matchAndUpdateContext(ctx: Context) {
    const matches = this.matchPath(ctx.path);
    if (matches?.groups) {
      ctx.params = matchGroupsToParams(matches.groups);
    }
    return matches;
  }
}

type Next = () => Promise<void>;

export type Middleware = (ctx: Context, next: Next) => Promise<void>;

interface RouterOpts {
  base?: string;
  notFound?: RouteFn;
}

const DEFAULT_NOTFOUND: RouteFn = () => {
  console.error('404 Not found');
  const el = document.createElement('div') as PageElement;
  el.pageTitle = '404 Not found';
  el.pageLayout = 'full';
  el.innerHTML = `
    <div class="vh-100 d-flex align-items-center justify-content-center">
      <div class="alert alert-danger text-center" style="min-width: 350px">
        <i class="bi bi-exclamation-circle"></i>
        Not found
      </div>
    </div>
  `;
  return el;
};

export class Router {
  private static instance: unknown;

  private readonly base: string;
  private readonly routes: Route[] = [];
  private readonly middlewares: Middleware[] = [];
  private readonly notFound: RouteFn;

  private _ctx?: Context;
  private prevDispatch = Promise.resolve();

  get ctx(): Context {
    if (!this._ctx) {
      throw new Error('router not ready');
    }
    return this._ctx;
  }

  constructor(opts?: RouterOpts) {
    if (Router.instance) {
      throw new Error('router must be singleton');
    }
    Router.instance = this;

    this.base = opts?.base ?? '/';
    this.notFound = opts?.notFound ?? DEFAULT_NOTFOUND;

    window.addEventListener('popstate', () => this.onPopstate());
    window.addEventListener('click', (evt) => this.onClick(evt));
  }

  async load() {
    const ctx = this.parse(location.pathname + location.search);
    await this.dispatch(ctx);
  }

  private parse(url: string): Context {
    const oUrl = new URL(url, 'http://a');
    const path = this.removePrefix(oUrl.pathname);
    return {
      router: this,
      originalPath: oUrl.pathname,
      path,
      params: {},
      query: Object.fromEntries(oUrl.searchParams),
      segments: path.split('/'),
      state: {},
    };
  }

  routeFor(path: string): Route | undefined {
    return this.routes.find((route) => route.matchPath(path));
  }

  link(path: string): string {
    if (path.startsWith('?')) {
      return this.ctx.originalPath + path;
    }

    return this.addPrefix(path);
  }

  use(middleware: Middleware) {
    this.middlewares.push(middleware);
  }

  route(path: string, fn: RouteFn) {
    this.routes.push(new Route(path, fn));
  }

  private addPrefix(path: string): string {
    const result = `/${(this.base + path).replace(/^\/+/, '').replace(/\/+$/, '')}`;
    return result;
  }

  private removePrefix(path: string): string {
    if (this.base === '/') {
      return path;
    }

    if (!path.startsWith(this.base)) {
      return '';
    }

    const result = path.slice(this.base.length) || '/';
    return result;
  }

  private invokeMiddlewareChain(ctx: Context, core: Middleware): Promise<void> {
    const middlewares = this.middlewares;
    const dispatchNext = (i: number): Promise<void> => {
      const fn = i === middlewares.length ? core : middlewares[i];
      return fn(ctx, () => dispatchNext(i + 1));
    };
    return dispatchNext(0);
  }

  private async onPopstate() {
    const url = location.pathname + location.search;
    const ctx = this.parse(url);
    await this.dispatch(ctx);
  }

  private async onClick(evt: MouseEvent) {
    const link = (evt.composedPath()[0] as HTMLElement).closest('a');
    if (
      link &&
      evt.button === 0 && // Left mouse button
      link.target !== '_blank' && // Not for new tab
      link.origin === location.origin && // Not external link
      link.rel !== 'external' && // Not external link
      link.target !== '_self' && // Now manually disabled
      !link.download && // Not download link
      !evt.altKey && // Not download link by user
      !evt.metaKey && // Not open in new tab by user
      !evt.ctrlKey && // Not open in new tab by user
      !evt.shiftKey && // Not open in new window by user
      !evt.defaultPrevented // Click was not cancelled
    ) {
      evt.preventDefault();
      const url = link.pathname + link.search;
      const ctx = this.parse(url);
      await this.dispatch(ctx);
      history.pushState(null, '', url);
    }
  }

  private dispatch(ctx: Context): Promise<void> {
    const prevDispatch = this.prevDispatch;
    this.prevDispatch = (async () => {
      try {
        await prevDispatch;
        await this._dispatch(ctx);
      } catch (err) {
        console.error('dispatch err:', err);
      }
    })();

    return this.prevDispatch;
  }

  private async _dispatch(ctx: Context): Promise<void> {
    if (ctx === this._ctx) {
      return;
    }

    this._ctx = ctx;

    await this.invokeMiddlewareChain(ctx, async () => {
      const route = this.routes.find((route) => route.matchAndUpdateContext(ctx));

      const el = route ? await route.fn(ctx) : await this.notFound(ctx);

      const pageEl = el as PageElement;

      pageEl.router = this;
      if (pageEl.routeCallback) {
        await pageEl.routeCallback();
      }

      ctx.element = el;
    });

    if (!ctx.element) {
      throw new Error('no element after router dispatch');
    }

    document.dispatchEvent(
      new CustomEvent('router-dispatch', {
        detail: ctx,
      }),
    );
  }

  async push(path: string) {
    const url = this.link(path);

    const ctx = this.parse(url);
    await this.dispatch(ctx);
    history.pushState(null, '', url);
  }

  async replace(path: string, keep = false) {
    const url = this.link(path);

    if (!keep) {
      const ctx = this.parse(url);
      await this.dispatch(ctx);
    }

    history.replaceState(null, '', url);
  }

  pop() {
    history.back();
  }
}

type Configurator = (router: Router, opts?: Record<string, unknown>) => void;

export function configureRouter(configurator: Configurator): Configurator {
  return configurator;
}

type RouteCallback = () => Promise<void>;

export interface PageElement extends HTMLElement {
  pageTitle?: string;
  pageLayout?: string;
  routeCallback?: RouteCallback;
  router?: Router;
}

function matchGroupsToParams(groups: Record<string, string>) {
  return Object.keys({ ...groups }).reduce<Record<string, string>>((result, key) => {
    result[key] = groups[key] ? decodeURIComponent(groups[key]) : '';
    return result;
  }, {});
}
