import { customElement } from 'lit/decorators.js';
import { Field } from './Field.js';
import { html } from 'lit';

interface RecordValue {
  [key: string]: unknown;
}

interface RecordErrors {
  [key: string]: string;
}

@customElement('f-record-field')
export class RecordField<T extends object = RecordValue> extends Field<T> {
  static of<T extends object = RecordValue>(target: unknown): RecordField<T> {
    if (!isFormElement(target)) {
      throw new Error('invalid form');
    }

    const record = target.firstElementChild;
    if (record instanceof RecordField === false) {
      throw new Error('invalid record field');
    }

    return record;
  }

  private initialValue: unknown;
  private fields: Field[] = [];

  set errors(errors: RecordErrors) {
    for (const field of this.fields) {
      field.error = errors[field.name] ?? '';
    }
  }

  get errors(): RecordErrors {
    const result: RecordErrors = {};

    for (const field of this.fields) {
      if (field.error) {
        result[field.name] = field.error;
      }
    }

    return result;
  }

  set value(value: unknown) {
    if (this.fields.length === 0) {
      this.initialValue = value;
      return;
    }

    if (typeof value !== 'object') {
      return;
    }

    this.initialValue = undefined;
    for (const field of this.fields) {
      field.value = (value as Record<string, unknown>)?.[field.name];
    }

    this.updateFormValue();
  }

  get value(): T | null {
    const recValue: Record<string, unknown> = {};
    for (const field of this.fields) {
      recValue[field.name] = field.value;
    }

    return recValue as T;
  }

  connectedCallback(): void {
    super.connectedCallback();

    this.fields = findFields(this);
    if (this.initialValue) {
      this.value = this.initialValue;
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.fields = [];
  }

  protected renderInput(): unknown {
    return html`
      <div @mutate=${this.onMutate}>
        <slot></slot>
      </div>
    `;
  }

  private onMutate(evt: Event) {
    evt.stopImmediatePropagation();

    this.updateFormValue();

    this.dispatchEvent(
      new CustomEvent('mutate', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  validate(): boolean {
    let ok = true;

    for (const field of this.fields) {
      const fieldOk = field.validate();
      ok = ok && fieldOk;
    }

    if (!ok) {
      this.error = 'has field error';
      return !this.error;
    }

    return super.validate();
  }

  assertValue(): T {
    this.validate();

    if (this.error) {
      throw new Error(this.error);
    }

    if (this.value === null) {
      throw new Error('value is null');
    }

    return this.value;
  }

  protected renderError(): unknown {
    return null;
  }
}

function findFields(el: Element): Field[] {
  const result = [];

  for (const childEl of el.children) {
    if (childEl instanceof Field) result.push(childEl);
    else result.push(...findFields(childEl));
  }

  return result;
}

function isFormElement(target: unknown): target is HTMLFormElement {
  return target !== null && typeof target === 'object';
}
