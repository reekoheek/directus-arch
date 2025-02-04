import { customElement, property } from 'lit/decorators.js';
import { CardModal } from './CardModal.js';
import { html } from 'lit';

export interface ConfirmModalOpts {
  message?: string;
  header?: string;
}

@customElement('c-confirm-modal')
export class ConfirmModal extends CardModal<boolean> {
  static show(opts: ConfirmModalOpts = {}) {
    const modal = new ConfirmModal();
    Object.assign(modal, opts);
    return modal.show();
  }

  @property()
  header = 'Confirm';

  @property()
  message = 'Are you sure?';

  protected renderCardBody(): unknown {
    return html`
      <div class="mb-3">
        ${this.message}
      </div>

      <div>
        <button type="button" class="btn btn-primary" @click=${this.onOK}>
          OK
        </button>
        <button type="button" class="btn btn-secondary" @click=${this.onCancel}>
          Cancel
        </button>
      </div>
    `;
  }

  private onOK(evt: Event) {
    evt.stopImmediatePropagation();

    this.returnValue(true);
  }

  private onCancel(evt: Event) {
    evt.stopImmediatePropagation();

    this.cancel();
  }
}
