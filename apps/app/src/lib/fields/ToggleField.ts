import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { Field } from './Field.js';

@customElement('f-toggle-field')
export class ToggleField extends Field<boolean> {
  protected renderLabel(): unknown {
    return null;
  }

  protected renderInput(): unknown {
    return html`
      <div class="form-check mb-3">
        <input type="checkbox" class="form-check-input" id=${this.fieldId}
          ?checked=${this.value ?? false}
          @change=${this.onMutate}
          @blur=${this.onMutate}
          ?disabled=${this.disabled}
        >
        <label class="form-check-label" for=${this.fieldId}>
          ${this.label}
        </label>
      </div>
    `;
  }

  protected onMutate(evt: Event) {
    evt.stopImmediatePropagation();
    const target = evt.target as HTMLInputElement;
    this.updateValue(target.checked);
  }
}
