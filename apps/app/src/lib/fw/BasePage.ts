import type { Router } from '@lib/router/Router.js';
import { LitElement } from 'lit';

export abstract class BasePage extends LitElement {
  protected router!: Router;
  protected pageTitle?: string;
  protected pageLayout?: string;

  routeCallback(): Promise<void> {
    return Promise.resolve();
  }

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }
}
