import { customElement, query } from 'lit/decorators.js';
import { CardModal } from './CardModal.js';
import { html } from 'lit';

@customElement('c-input-modal')
export class InputModal extends CardModal<string> {
  static show(header: string) {
    const modal = new InputModal();
    modal.header = header;
    return modal.show();
  }

  @query('#input')
  input!: HTMLInputElement;

  protected firstUpdated(): void {
    const input = this.shadowRoot?.querySelector('input') as HTMLInputElement;
    input.focus();
  }

  protected renderCardBody(): unknown {
    return html`
      <form @submit=${this.onSubmit}>
        <div class="mb-3">
          <input id="input" type="text" class="form-control">
        </div>

        <div>
          <button type="submit" class="btn btn-primary">
            OK
          </button>
        </div>
      </form>
    `;
  }

  private onSubmit(evt: Event) {
    evt.preventDefault();
    evt.stopImmediatePropagation();

    this.returnValue(this.input.value);
  }
}
