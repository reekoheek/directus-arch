import { html, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Field } from './Field.js';
import { type ComboBoxLitRenderer, comboBoxRenderer } from '@vaadin/combo-box/lit.js';
import type { ComboBox, ComboBoxFilterChangedEvent } from '@vaadin/combo-box';
import '@vaadin/combo-box';
import { debounce } from '@lib/utils/debounce.js';

export type LookupItemRenderer = ComboBoxLitRenderer<Record<string, unknown>>;

export type LookupFn = (q: string) => Promise<Record<string, unknown>[]>;

@customElement('f-lookup-field')
export class LookupField extends Field<string> {
  @property()
  protected itemRenderer: LookupItemRenderer = (item: Record<string, unknown>) => {
    return html`
      <div>
        ${item[this.labelpath] ?? item.id}
      </div>
    `;
  };

  @property()
  protected lookup?: LookupFn;

  @property()
  protected labelpath = 'name';

  @property()
  protected valuepath = 'id';

  @state()
  private items?: Record<string, unknown>[];

  readonly requestLookup = debounce(async (search: string) => {
    if (!this.lookup) {
      throw new Error('undefined lookup method');
    }

    this.items = await this.lookup(search);
  }, 100);

  protected updated(props: PropertyValues): void {
    if (props.has('_value')) {
      this.requestLookup(this.value ?? '');
    }
  }

  protected renderInput(): unknown {
    return html`
      <vaadin-combo-box class="form-control d-flex p-0 ${this.error ? 'is-invalid' : ''}"
        .disabled=${this.disabled}
        .value=${this.value ?? ''}
        item-label-path=${this.labelpath}
        item-value-path=${this.valuepath}
        .filteredItems=${this.items}
        @filter-changed=${this.onFilterChanged}
        @change=${this.onMutate}
        @blur=${this.onMutate}
        @keydown="${this.onKeyDown}"
        ${comboBoxRenderer(this.itemRenderer, [])}
      ></vaadin-combo-box>
    `;
  }

  protected onMutate(evt: Event) {
    evt.stopImmediatePropagation();
    const target = evt.target as HTMLInputElement;
    this.updateValue(target.value);
  }

  protected onKeyDown(evt: KeyboardEvent) {
    if (evt.key !== 'Enter') {
      return;
    }

    const target = evt.currentTarget as ComboBox;
    if (target.opened) {
      return;
    }

    evt.stopImmediatePropagation();
    this.requestFormSubmit();
  }

  private onFilterChanged(evt: ComboBoxFilterChangedEvent) {
    this.requestLookup(evt.detail.value);
  }
}
