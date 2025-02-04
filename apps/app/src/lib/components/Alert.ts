import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

type Variant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning';

export const _ = ['alert-primary', 'alert-secondary', 'alert-success', 'alert-danger', 'alert-warning'];

@customElement('c-alert')
export class Alert extends LitElement {
  @property()
  public variant: Variant = 'primary';

  @property()
  public message = '';

  @property()
  public icon = '';

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  protected render(): unknown {
    if (!this.message) {
      return;
    }

    return html`
      <div class="alert alert-${this.variant}">
        <i class="bi ${this.icon}" ?hidden=${!this.icon}></i>
        ${this.message}
      </div>
    `;
  }
}
