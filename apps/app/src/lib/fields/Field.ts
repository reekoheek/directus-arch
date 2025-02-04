import { property, state } from 'lit/decorators.js';
import { html, LitElement } from 'lit';
import { getStyles } from '@lib/style/index.js';
import type { Rule } from './Rule.js';

let nextId = 0;

function getNextId() {
  nextId++;
  return nextId;
}

export class Field<T = unknown> extends LitElement {
  static readonly styles = [...getStyles()];

  static readonly formAssociated = true;

  @property()
  name = '';

  @property({ type: Boolean })
  required = false;

  @property({ type: Boolean })
  disabled = false;

  @property({ attribute: false })
  rules: Rule<T>[] = [];

  @property()
  error = '';

  @property()
  label = '';

  @property()
  info = '';

  @property()
  placeholder = '';

  @state()
  protected _value: T | null = null;

  protected _internals: ElementInternals;
  protected _touched = false;
  protected fieldId = `field$${getNextId()}`;

  set value(value: unknown) {
    this._value = this.convert(value);
    this.updateFormValue();
  }

  get value(): T | null {
    return this._value ?? null;
  }

  constructor() {
    super();
    this._internals = this.attachInternals();
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('field', this.fieldId);
  }

  protected updateValue(value: unknown) {
    const newValue = this.convert(value);

    if (this._value === newValue && this._touched) {
      return;
    }

    this._touched = true;
    this.error = '';
    this._value = newValue;

    this.validate();

    this.updateFormValue();

    this.dispatchEvent(
      new CustomEvent('mutate', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  protected updateFormValue() {
    let formValue: string;
    if (isEmpty(this.value)) {
      formValue = '';
    } else if (typeof this.value === 'string') {
      formValue = this.value;
    } else {
      formValue = JSON.stringify(this.value);
    }
    this._internals.setFormValue(formValue);
  }

  protected requestFormSubmit() {
    if (this._internals.form) {
      this._internals.form.requestSubmit();
      return;
    }

    this.dispatchEvent(
      new CustomEvent('request-submit', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  protected convert(value: unknown): T | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    return value as T;
  }

  validate(): boolean {
    this.error = '';

    if (isEmpty(this.value)) {
      if (this.required) {
        this.error = 'required';
      }
      return !this.error;
    }

    for (const rule of this.rules) {
      const err = rule(this.value);
      if (err) {
        this.error = err;
        return false;
      }
    }

    return true;
  }

  protected render(): unknown {
    return html`
      <div>
        ${this.renderLabel()}
        ${this.renderInfo()}
        ${this.renderInput()}
        ${this.renderError()}
      </div>
    `;
  }

  protected renderLabel(): unknown {
    if (!this.label) {
      return;
    }

    return html`
      <label for="${this.fieldId}" class="form-label">
        ${[this.label, this.required ? html`<small class="text-danger">*</small>` : '']}
      </label>
    `;
  }

  protected renderInfo(): unknown {
    if (!this.info) {
      return;
    }

    return html`
      <div class="small text-body-secondary">
        ${this.info}
      </div>
    `;
  }

  protected renderInput(): unknown {
    return null;
  }

  protected renderError(): unknown {
    if (!this.error) {
      return;
    }

    return html`
      <div class="text-danger small">
        <i class="bi bi-exclamation-circle-fill"></i>
        ${this.error}
      </div>
    `;
  }
}

function isEmpty(value: unknown) {
  return value === undefined || value === null;
}
