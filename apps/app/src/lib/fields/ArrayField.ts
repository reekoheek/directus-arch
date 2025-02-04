import { customElement, state } from 'lit/decorators.js';
import { Field } from './Field.js';
import { css, html } from 'lit';
import '@lib/components/Button.js';

@customElement('f-array-field')
export class ArrayField<T = unknown> extends Field<T[]> {
  static styles = [
    ...super.styles,
    css`
      .sort-handle {
        cursor: grabbing;
      }

      li[dragover=below] {
        border-bottom: 3px solid red !important;
      }

      li[dragover=above] {
        border-top: 3px solid red !important;
      }
    `,
  ];

  @state()
  private fields: Field[] = [];

  private template?: Field;

  set errors(errors: string[]) {
    this.fields.forEach((field, index) => {
      field.error = errors[index] ?? '';
    });
  }

  get errors(): string[] {
    const result: string[] = [];
    this.fields.forEach((field, index) => {
      result[index] = field.error;
    });
    return result;
  }

  set value(value: unknown) {
    this._value = value as T[];

    this.calculateFields();

    this.updateFormValue();
  }

  get value(): T[] | null {
    if (this.fields.length === 0) {
      return null;
    }

    const value = this.fields.map((field) => {
      return field.value;
    });

    return value as T[];
  }

  connectedCallback(): void {
    super.connectedCallback();

    this.template = this.createTemplate();

    this.calculateFields();
  }

  private calculateFields() {
    if (!this.template) {
      return;
    }

    const valueEntries = this._value ?? [];

    if (this.fields.length === valueEntries.length) {
      return;
    }

    this.fields = [];
    for (const value of valueEntries) {
      const field = createField(this.template);
      field.value = value;
      this.fields.push(field);
    }
  }

  protected createTemplate(): Field {
    const template = this.firstElementChild?.cloneNode(true);
    if (template instanceof Field === false) {
      throw new Error('invalid template as field');
    }
    return template;
  }

  protected renderInput(): unknown {
    return html`
      <ul
        class="list-group mb-3"
        @mutate=${this.onMutate}
        @request-submit=${this.onRequestSubmit}
        @dragover=${this.onDragOver}
        @dragend=${this.onDragEnd}
        @drop=${this.onDrop}
      >
        ${this.renderFields()}
      </ul>

      <c-button
        type="button"
        variant="primary"
        icon="plus-lg"
        label="Add"
        @click=${this.onAddClick}
      ></c-button>
    `;
  }

  private onRequestSubmit(evt: Event) {
    evt.stopImmediatePropagation();
    this.requestFormSubmit();
  }

  private renderFields() {
    return this.fields.map((field, index) => {
      return html`
        <li class="list-group-item px-0"
          index=${index}
        >
          <div class="d-flex align-items-start">
            <div
              class="sort-handle btn"
              draggable="true"
              @dragstart=${this.onDragStart}
            >
              &#x2630;
            </div>

            <div class="flex-grow-1">
              ${field}
            </div>

            <button type="button" class="btn"
              @click=${(evt: Event) => this.onRemoveClick(evt, index)}
            >
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </li>
      `;
    });
  }

  private draggingElement?: HTMLElement;
  private dragoverElement?: HTMLElement;
  private onDragStart(evt: DragEvent) {
    if (!evt.dataTransfer) {
      throw new Error('unexpected error invalid event');
    }

    const target = evt.target as HTMLElement;
    const itemEl = target.closest('li');
    if (!itemEl) {
      throw new Error('invalid item');
    }

    this.draggingElement = itemEl;
    const rect = target.getBoundingClientRect();

    evt.dataTransfer.effectAllowed = 'move';
    evt.dataTransfer?.setDragImage(itemEl, Math.floor(evt.clientX - rect.left), Math.floor(evt.clientY - rect.top));
  }

  private dragY = -1;
  private onDragOver(evt: DragEvent) {
    evt.preventDefault();

    const target = evt.target as HTMLElement;
    const itemEl = target.closest('li');

    if (!itemEl || this.draggingElement === itemEl) {
      return;
    }

    const y = Math.floor(evt.clientY);

    if (this.dragY === y) {
      return;
    }

    this.dragY = y;

    if (this.dragoverElement) {
      this.dragoverElement.removeAttribute('dragover');
    }

    this.dragoverElement = itemEl;

    const rect = itemEl.getBoundingClientRect();
    const midY = rect.height / 2;
    const posY = y - rect.top;

    this.dragoverElement.setAttribute('dragover', posY < midY ? 'above' : 'below');
  }

  private onDrop() {
    if (!this.dragoverElement) {
      return;
    }

    if (!this.draggingElement || !this.dragoverElement) {
      throw new Error('unexpected error no dragging or dragover element');
    }

    if (!this._value) {
      throw new Error('unexpected error, no value');
    }

    const oldIndex = Number(this.draggingElement.getAttribute('index'));
    const dropIndex = Number(this.dragoverElement.getAttribute('index'));
    const dragoverState = this.dragoverElement.getAttribute('dragover');

    const dropField = this.fields[dropIndex];
    const deletedFields = this.fields.splice(oldIndex, 1);
    const dropFieldIndex = this.fields.indexOf(dropField);
    const newIndex = dragoverState === 'above' ? dropFieldIndex : dropFieldIndex + 1;
    this.fields.splice(newIndex, 0, deletedFields[0]);

    const deletedValue = this._value.splice(oldIndex, 1);
    this._value.splice(newIndex, 0, deletedValue[0]);

    this.fields = [...this.fields];

    this.updateFormValue();

    this.dispatchEvent(
      new CustomEvent('mutate', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  private onDragEnd() {
    if (this.dragoverElement) {
      this.dragoverElement.removeAttribute('dragover');
    }
    this.dragoverElement = undefined;
    this.draggingElement = undefined;
  }

  private onAddClick(evt: Event) {
    evt.stopImmediatePropagation();

    if (!this.template) {
      throw new Error('undefined template');
    }

    this.fields = [...this.fields, createField(this.template)];

    this.updateFormValue();

    this.dispatchEvent(
      new CustomEvent('mutate', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  private onRemoveClick(evt: Event, index: number) {
    evt.stopImmediatePropagation();

    this.fields.splice(index, 1);
    this.fields = [...this.fields];

    this.updateFormValue();

    this.dispatchEvent(
      new CustomEvent('mutate', {
        bubbles: true,
        composed: true,
      }),
    );
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
      this.error = 'has item error';
      return !this.error;
    }

    return super.validate();
  }
}

function createField(template: Field): Field {
  return template.cloneNode(true) as Field;
}
