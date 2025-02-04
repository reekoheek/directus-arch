import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { Field } from './Field.js';

@customElement('f-number-field')
export class TextField extends Field<number> {
  protected renderInput() {
    return html`
      <input type="number"
        id=${this.fieldId}
        class="form-control ${this.error ? 'is-invalid' : ''}"
        .value=${this._value?.toString() ?? ''}
        @input=${this.onMutate}
        @blur=${this.onMutate}
        @keydown=${this.onKeyDown}
        novalidate
        ?disabled=${this.disabled}
      >
    `;
  }

  protected onMutate(evt: Event) {
    evt.stopImmediatePropagation();
    const target = evt.target as HTMLInputElement;
    this.updateValue(target.value);
  }

  protected convert(value: unknown): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const numValue = Number(value);
    if (Number.isNaN(numValue)) {
      return null;
    }
    return numValue;
  }

  protected onKeyDown(evt: KeyboardEvent) {
    if (evt.key !== 'Enter') {
      return;
    }

    evt.stopImmediatePropagation();
    this.requestFormSubmit();
  }
}
