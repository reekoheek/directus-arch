import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Modal } from './Modal.js';

@customElement('c-card-modal')
export class CardModal<T = unknown> extends Modal<T> {
  @property()
  header = '...';

  protected renderBody(): unknown {
    return html`
      <div class="card">
        <div class="card-header">
          ${this.header}
        </div>

        <div class="card-body">
          ${this.renderCardBody()}
        </div>
      </div>
    `;
  }

  protected renderCardBody(): unknown {
    return html`
      <slot></slot>
    `;
  }
}
