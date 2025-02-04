import { html } from 'lit';
import { Field } from './Field.js';
import '@lib/components/Table.js';
import '@lib/components/Modal.js';
import '@lib/fields/RecordField.js';
import { customElement, query, state } from 'lit/decorators.js';
import type { Modal } from '@lib/components/Modal.js';
import type { RecordField } from './RecordField.js';
import type { TableColumn } from '@lib/components/Table.js';

interface Property {
  name: string;
  label: string;
  type?: string;
  width?: number;
}

@customElement('f-table-field')
export class TableField<T = unknown> extends Field<T[]> {
  protected addLabel = 'Add Item';
  protected submitLabel = 'Save';

  @query('#formModal')
  private readonly formModal!: Modal;

  @query('#formRecord')
  private readonly formRecord!: RecordField;

  @state()
  private properties: Property[] = [];

  connectedCallback(): void {
    super.connectedCallback();

    const props = [...this.querySelectorAll('f-table-prop')];
    this.properties = props.map((prop) => {
      const width = prop.getAttribute('width');
      return {
        name: prop.getAttribute('name') ?? '',
        label: prop.getAttribute('label') ?? '',
        type: prop.getAttribute('type') ?? undefined,
        width: width ? Number(width) : undefined,
      };
    });
  }

  private getTableColumns(): TableColumn<T>[] {
    return this.properties.map((prop) => {
      return {
        name: prop.name,
        label: prop.label,
        align: prop.type === 'number' ? 'end' : 'start',
      };
    });
  }

  protected renderInput(): unknown {
    return html`
      <div class="card">
        <div class="card-body p-3">
          <div class="d-flex">
            <div class="flex-grow-1"></div>
            <div class="mb-3">
              <button type="button" class="btn btn-primary" @click=${this.onAddClick}>
                Add
              </button>
            </div>
          </div>
          <c-table
            .columns=${this.getTableColumns()}
            .items=${this.value}
            .tailRenderer=${this.renderTail}
            @click=${this.onTableClick}
          ></c-table>
        </div>
      </div>
      <c-modal id="formModal">
        <div class="card">
          <div class="card-header">
            ${this.addLabel}
          </div>
          <div class="card-body">
            <form @submit=${this.onFormSubmit}>
              <f-record-field id="formRecord">
                ${this.properties.map((prop) => this.renderField(prop))}
              </f-record-field>

              <div>
                <c-button variant="primary" type="submit" label=${this.submitLabel}></c-button>
                <c-button label="Back" @click=${this.onBackClick}></c-button>
              </div>
            </form>
          </div>
        </div>
      </c-modal>
    `;
  }

  private onBackClick(evt: Event) {
    evt.stopImmediatePropagation();

    this.formRecord.value = {};
    this.formRecord.errors = {};
    this.formModal.cancel();
  }

  private onFormSubmit(evt: Event) {
    evt.preventDefault();

    if (!this.formRecord.validate()) {
      return;
    }

    const items = this.value ?? [];
    const value = [...items, this.formRecord.value];

    this.formRecord.value = {};
    this.formRecord.errors = {};

    this.formModal.returnValue(value);
  }

  private renderField(prop: Property) {
    return html`
      <div class="mb-3">
        <f-text-field
          name=${prop.name}
          label=${prop.label}
        ></f-text-field>
      </div>
    `;
  }

  private renderTail() {
    return html`
      <button type="button" class="btn-close" aria-label="Remove"></button>
    `;
  }

  private onTableClick(evt: Event) {
    const target = evt.composedPath()[0] as HTMLElement;
    if (!target.matches('.btn-close')) {
      return;
    }

    const index = rowIndex(target);
    const items = this.value ?? [];
    items.splice(index, 1);
    this.value = [...items];
  }

  private onAddClick(evt: Event) {
    evt.stopImmediatePropagation();

    this.formModal.show();
  }
}

function rowIndex(el: HTMLElement): number {
  const itemEl = el.closest('tr');
  if (!itemEl) {
    throw new Error('invalid table row');
  }
  return Array.prototype.indexOf.call(itemEl.parentElement?.children, itemEl);
}
