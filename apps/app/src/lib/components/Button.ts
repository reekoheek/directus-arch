import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success';
type ButtonType = 'submit' | 'button';

@customElement('c-button')
export class Button extends LitElement {
  @property()
  public variant: ButtonVariant = 'secondary';

  @property()
  public type: ButtonType = 'button';

  @property()
  public label = '';

  @property()
  public icon = '';

  @property({ type: Boolean })
  public processing = false;

  @property({ type: Boolean })
  public disabled = false;

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  protected render(): unknown {
    return html`
      <button type="${this.type}"
        class="btn btn-${this.variant}"
        ?disabled=${this.disabled || this.processing}>
        <span class="spinner-border spinner-border-sm" aria-hidden="true" ?hidden=${!this.processing}></span>
        <span class="bi bi-${this.icon}" ?hidden=${this.processing}></span>
        ${this.label}
      </button>
    `;
  }
}
