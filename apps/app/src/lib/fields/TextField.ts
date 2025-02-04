import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Field } from './Field.js';

type TextType = 'text' | 'search' | 'tel' | 'url' | 'email' | 'password' | 'color' | 'date';

@customElement('f-text-field')
export class TextField extends Field<string> {
  @property()
  public type: TextType = 'text';

  @property({ type: Boolean })
  public autofocus = false;

  protected renderInput() {
    return html`
      <input type=${this.type}
        id=${this.fieldId}
        class="form-control ${this.error ? 'is-invalid' : ''}"
        placeholder=${this.placeholder}
        .value=${this._value ?? ''}
        @input=${this.onMutate}
        @blur=${this.onMutate}
        @keydown=${this.onKeyDown}
        novalidate
        ?disabled=${this.disabled}
        ?autofocus=${this.autofocus}
      >
    `;
  }

  protected onMutate(evt: Event) {
    evt.stopImmediatePropagation();
    this.updateValue((evt.target as HTMLInputElement).value);
  }

  protected onKeyDown(evt: KeyboardEvent) {
    if (evt.key !== 'Enter') {
      return;
    }

    evt.stopImmediatePropagation();
    this.requestFormSubmit();
  }
}
