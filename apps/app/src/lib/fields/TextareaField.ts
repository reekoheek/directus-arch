import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Field } from './Field.js';

@customElement('f-textarea-field')
export class TextField extends Field<string> {
  @property({ type: Number })
  rows = 5;

  protected renderInput() {
    return html`
      <textarea
        id=${this.fieldId}
        class="form-control ${this.error ? 'is-invalid' : ''}"
        .value=${this._value ?? ''}
        @input=${this.onMutate}
        @blur=${this.onMutate}
        novalidate
        ?disabled=${this.disabled}
        rows=${this.rows}
      ></textarea>
    `;
  }

  protected onMutate(evt: Event) {
    evt.stopImmediatePropagation();
    const target = evt.target as HTMLInputElement;
    this.updateValue(target.value);
  }
}
