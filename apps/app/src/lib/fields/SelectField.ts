import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { Field } from './Field.js';

@customElement('f-select-field')
export class SelectField extends Field<string> {
  static EMPTY_OPTIONS = {
    '': '--',
  };

  @state()
  protected options?: Record<string, string>;

  async connectedCallback(): Promise<void> {
    super.connectedCallback();

    this.options = await this.createOptions();
  }

  protected async createOptions(): Promise<Record<string, string>> {
    await Promise.resolve();

    const options: Record<string, string> = {};

    for (const el of this.children) {
      if (el instanceof HTMLOptionElement) {
        options[el.value] = el.text;
      }
    }

    return options;
  }

  protected convert(value: unknown): string | null {
    if (value === undefined || value === null || value === '') {
      return null;
    }

    return `${value as string}`;
  }

  protected renderInput(): unknown {
    const options = this.options;
    if (!options) {
      return;
    }

    return html`
      <select
        id=${this.fieldId}
        class="form-select ${this.error ? 'is-invalid' : ''}"
        @change=${this.onMutate}
        @blur=${this.onMutate}
        ?disabled=${this.disabled}
      >
        ${Object.keys(options).map(
          (key) => html`
          <option value=${key} ?selected=${(this.value ?? '') === key}>
            ${options[key]}
          </option>
        `,
        )}
      </select>
    `;
  }

  protected onMutate(evt: Event) {
    evt.stopImmediatePropagation();
    const target = evt.target as HTMLInputElement;
    this.updateValue(target.value);
  }
}
