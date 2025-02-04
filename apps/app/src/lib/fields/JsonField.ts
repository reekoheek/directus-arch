import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Field } from './Field.js';

@customElement('f-json-field')
export class JsonField<T = unknown> extends Field<T> {
  @property({ type: Number })
  rows = 5;

  protected renderInput() {
    return html`
      <textarea
        id=${this.fieldId}
        rows="${this.rows}"
        class="form-control ${this.error ? 'is-invalid' : ''}"
        .value=${this._value ? JSON.stringify(this._value, null, 2) : ''}
        @input=${this.onMutate}
        @blur=${this.onMutate}
        novalidate
        ?disabled=${this.disabled}
      ></textarea>
    `;
  }

  protected onMutate(evt: Event) {
    evt.stopImmediatePropagation();
    const target = evt.target as HTMLInputElement;
    try {
      const value = JSON.parse(target.value);
      this.updateValue(value);
    } catch {
      this.error = 'invalid';
    }
  }
}
