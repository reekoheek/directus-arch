import { customElement, state } from 'lit/decorators.js';
import { html, LitElement } from 'lit';
import { router } from '../../runtime/router.js';
import '@lib/components/Menu.js';
import { createMenu } from '../../runtime/menu.js';
import logo from '@runtime/img/lumba.png';
import type { MenuGroup } from '@lib/components/Menu.js';
import { config } from '../../runtime/config.js';
import { auth } from '../../runtime/auth.js';

@customElement('a-app')
export class App extends LitElement {
  @state()
  private page?: HTMLElement = router.ctx.element;

  @state()
  private menu: MenuGroup[] = createMenu();

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  connectedCallback(): void {
    super.connectedCallback();

    document.addEventListener('i18n-locale', () => {
      this.menu = createMenu();
    });

    document.addEventListener('router-dispatch', () => {
      this.page = router.ctx.element;
    });
  }

  protected render(): unknown {
    return html`
      <style>
        [layout=full] nav {
          display: none;
        }

        @media only screen and (min-width: 992px) {
          a-app {
            display: flex;
            height: 100vh;
            overflow: hidden;
          }

          a-app > nav {
            position: relative;
            width: 280px;
            flex-basis: 280px;
            overflow-y: auto;
          }

          a-app > main {
            flex: 1;
            overflow-y: auto;
          }
        }

        @media(max-width:767px) {
          a-app > nav {
            border: 0;
          }
        }
      </style>

      <nav class="border-end bg-body-tertiary">
        <div class="p-3 pb-0">
          <img src="${logo}" alt="" style="width: 100%">
          <div class="text-danger small text-center">
            ${config.dev ? 'dev' : ''}
          </div>
        </div>
        <c-menu .groups=${this.menu}></c-menu>
      </nav>

      <main>
        ${this.page}
      </main>
    `;
  }
}
