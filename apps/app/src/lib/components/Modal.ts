import { getStyles } from '@lib/style/index.js';
import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { getTheme } from './theme.js';

type Size = '' | 'lg' | 'sm' | 'xl' | 'fullscreen';

@customElement('c-modal')
export class Modal<T = unknown> extends LitElement {
  static readonly styles = [
    ...getStyles(),
    css`
      .show {
        display: block!important;
      }

      .modal-backdrop {
        display: none;
      }

      .modal-content {
        min-height: 45px;
      }

      .modal-content > .btn-close {
        position: absolute;
        top: 10px;
        right: 10px;
      }
    `,
  ];

  @property()
  public size: Size = '';

  @property({ attribute: false })
  public value?: T;

  @state()
  private visible = false;

  private containerElement?: HTMLElement;

  protected render(): unknown {
    const visibleClass = this.visible ? 'show' : '';
    return html`
      <div data-bs-theme=${getTheme()}>
        <div class="modal-backdrop ${visibleClass}"></div>
        <div class="modal fade ${visibleClass}" tabindex="-1" @click=${this.onOuterClick}>
          <div class="modal-dialog modal-${this.size} modal-dialog-centered modal-fullscreen-sm-down">
            <div class="modal-content">
              ${this.renderBody()}

              <button type="button" class="btn-close" aria-label="Close" @click=${this.onCloseClick}></button>
            </div>
          </div>
        </div>
        <slot></slot>
      </div>
    `;
  }

  protected renderBody(): unknown {
    return html`
      <slot></slot>
    `;
  }

  private onOuterClick(evt: Event) {
    const target = evt.target as HTMLElement;
    if (!target.matches('.modal')) {
      return;
    }
    this.cancel();
  }

  private onCloseClick(evt: Event) {
    evt.stopImmediatePropagation();

    this.cancel();
  }

  show(): Promise<T | undefined> {
    if (!this.isConnected) {
      this.containerElement = document.body;
      this.containerElement.appendChild(this);
    }

    return new Promise((resolve) => {
      const escListener = (evt: KeyboardEvent) => {
        if (evt.key === 'Escape') {
          window.removeEventListener('keydown', escListener);
          this.cancel();
        }
      };
      window.addEventListener('keydown', escListener);

      const onHide = () => {
        this.removeEventListener('modal-hide', onHide);
        resolve(this.value);
      };
      this.addEventListener('modal-hide', onHide);

      this.visible = true;
      this.dispatchEvent(
        new CustomEvent('modal-show', {
          bubbles: true,
          composed: true,
        }),
      );
    });
  }

  hide() {
    this.visible = false;
    this.dispatchEvent(
      new CustomEvent('modal-hide', {
        bubbles: true,
        composed: true,
      }),
    );

    if (this.containerElement) {
      this.containerElement.removeChild(this);
      this.containerElement = undefined;
    }
  }

  returnValue(value?: T) {
    this.value = value;
    this.hide();
  }

  cancel() {
    this.value = undefined;
    this.hide();
  }
}
