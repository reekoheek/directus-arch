import { getStyles } from '@lib/style/index.js';
import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { getTheme } from './theme.js';
import tableCss from './Table.css?inline';
import { debounce } from '@lib/utils/debounce.js';

type TableCellRenderer<T> = (item: T, key: string) => unknown;

export type TableTailCellRenderer<T> = (item: T, index: number) => unknown;

type TableColumnAlign = 'start' | 'end';

function getColumnAlign(s: string): TableColumnAlign {
  return ['start', 'end'].includes(s) ? (s as TableColumnAlign) : 'start';
}

type RowPartGenerator<T> = (item: T) => string;

const DEFAULT_COLUMN_WIDTH = 160;

export interface TableColumn<T> {
  name: string;
  label: string;
  align?: TableColumnAlign;
  renderer?: TableCellRenderer<T>;
  width?: number;
}

@customElement('c-table')
export class Table<T = unknown> extends LitElement {
  static readonly styles = [...getStyles(), unsafeCSS(tableCss)];

  @property({ type: Boolean })
  public sortable = false;

  @property({ type: Boolean })
  public selectable = false;

  @property({ type: Boolean })
  public striped = false;

  @property()
  public rowPartGenerator?: RowPartGenerator<T>;

  @property()
  public tailCellRenderer?: TableTailCellRenderer<T>;

  set items(items: T[] | undefined | null) {
    if (items === this._items) {
      return;
    }

    this._items = items ?? [];

    this._selectedItems = [];
    this.dispatchEvent(
      new CustomEvent('selected-change', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  get items() {
    return this._items;
  }

  get selectedItems() {
    return this._selectedItems;
  }

  @state()
  private _items: T[] = [];

  @state()
  private _selectedItems: T[] = [];

  private resizeColumn?: TableColumn<T>;
  private resizeStart = 0;
  private columns: TableColumn<T>[] = [];
  private resizeX = -1;
  private readonly requestResize = debounce((x: number) => {
    if (x === this.resizeX) {
      return;
    }

    this.resizeX = x;

    const col = this.endResize(x);
    if (!col) {
      return;
    }

    this.startResize(col, x);
  }, 1);

  connectedCallback(): void {
    super.connectedCallback();

    this.columns = this.createColumns();
  }

  protected createColumns(): TableColumn<T>[] {
    const elements = [...this.querySelectorAll('c-table-column')];
    if (elements.length === 0) {
      return [];
    }

    return elements.map((el) => {
      const name = el.getAttribute('name');
      if (!name) {
        throw new Error('undefined name in table column');
      }

      const label = el.hasAttribute('label') ? (el.getAttribute('label') ?? '') : name;

      return {
        name,
        label,
        align: getColumnAlign(el.getAttribute('align') ?? ''),
        renderer: (el as unknown as { renderer: TableCellRenderer<T> }).renderer ?? undefined,
        width: el.hasAttribute('width') ? Number(el.getAttribute('width')) : undefined,
      };
    });
  }

  protected render(): unknown {
    const items = this._items;

    const columns: string[] = [];
    if (this.sortable) columns.push('32px');
    if (this.selectable) columns.push('min-content');
    columns.push(...this.columns.map((column) => `${column.width ?? DEFAULT_COLUMN_WIDTH}px`));
    columns.push('1fr', 'min-content');

    const gridColumnsStyle = `--grid-columns: ${columns.join(' ')}`;

    const sortableHandle = this.sortable ? html`<th></th>` : undefined;
    const selectAllCheckbox = this.selectable
      ? html`
        <th>
          <input type="checkbox"
            id="cTableAllSelect"
            class="form-check-input"
            .checked=${this.isAllSelected()}
            .indeterminate=${this.isPartialSelected()}
            @change=${this.onSelectAllChange}
          >
        </th>
      `
      : undefined;

    const empty = () => {
      if (items.length) return;
      return html`
        <tr>
          <td style="grid-column: span ${columns.length - 1};" class="text-center"> -- </td>
        </tr>
      `;
    };

    return html`
      <div class="table-responsive" data-bs-theme=${getTheme()}>
        <table class="table ${this.striped ? 'table-striped' : ''} table-hover m-0" style=${gridColumnsStyle}>
          <thead class="user-select-none">
            <tr
              @pointermove=${this.onPointerMove}
              @pointerup=${this.onPointerUp}
              @pointerleave=${this.onPointerUp}
            >
              ${sortableHandle}
              ${selectAllCheckbox}
              ${this.columns.map((col) => this.renderColHeader(col))}
              <th></th>
              <th class="p-0"></th>
            </tr>
          </thead>
          <tbody
            @dragstart=${this.onDragStart}
            @dragover=${this.onDragOver}
            @dragend=${this.onDragEnd}
          >
            ${empty()}
            ${items.map((item, index) => this.renderItem(item, index))}
          </tbody>
        </table>
      </div>
    `;
  }

  @state()
  private draggingItem?: T;

  private itemOf(el: HTMLElement): T {
    const tr = el.closest('tr');
    if (!tr) {
      throw new Error('oops');
    }
    const index = Number(tr.dataset.index);
    return this._items[index];
  }

  private onDragStart(evt: DragEvent) {
    if (!evt.dataTransfer) {
      throw new Error('invalid drag event');
    }

    const tr = (evt.target as HTMLElement).closest('tr') as HTMLTableRowElement;
    if (!tr) {
      return;
    }
    tr.setAttribute('draggable', 'true');
    evt.dataTransfer.effectAllowed = 'move';

    this.draggingItem = this.itemOf(tr);
  }

  private onDragOver(evt: MouseEvent) {
    evt.preventDefault();

    if (!this.draggingItem) {
      return;
    }

    const rowOver = (evt.target as HTMLElement).closest('tr');
    if (!rowOver) {
      return;
    }

    const itemOver = this.itemOf(rowOver);
    if (this.draggingItem === itemOver) {
      return;
    }

    const bounding = rowOver.getBoundingClientRect();
    const offset = Math.floor(evt.clientY - bounding.top);
    const targetIndex = this._items.indexOf(itemOver);
    const draggingIndex = this._items.indexOf(this.draggingItem);

    const isMoving =
      (offset > rowOver.offsetHeight / 2 && targetIndex > draggingIndex) ||
      (offset <= rowOver.offsetHeight / 2 && targetIndex < draggingIndex);
    if (isMoving) {
      this.moveRow(draggingIndex, targetIndex, this.draggingItem);
    }
  }

  private moveRow(oldIndex: number, newIndex: number, item: T) {
    const newItems = [...this._items];
    newItems.splice(oldIndex, 1);
    newItems.splice(newIndex, 0, item);
    this._items = newItems;
    this.dispatchEvent(new CustomEvent('sort'));
  }

  private onDragEnd(evt: Event) {
    const tr = (evt.target as HTMLElement).closest('tr') as HTMLTableRowElement;
    tr.removeAttribute('draggable');
    this.draggingItem = undefined;
  }

  private isAllSelected() {
    const isAllSelected = this._items.length !== 0 && this._selectedItems.length === this._items.length;
    return isAllSelected;
  }

  private isPartialSelected() {
    const isPartialSelected = this._selectedItems.length !== 0 && this._selectedItems.length !== this._items.length;
    return isPartialSelected;
  }

  private onSelectAllChange(evt: Event) {
    const target = evt.target as HTMLInputElement;
    this._selectedItems = target.checked ? [...this._items] : [];
    this.dispatchEvent(
      new CustomEvent('selected-change', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  private renderColHeader(col: TableColumn<T>) {
    return html`
      <th scope="col">
        <div class="text-truncate text-nowrap ${alignClass(col.align)}">
          ${col.label ?? col.name}
        </div>

        <div
          class="resize-handle"
          @pointerdown=${(evt: MouseEvent) => this.onPointerDown(evt, col)}
        >
          <span class="separator"></span>
        </div>
      </th>
    `;
  }

  private startResize(col: TableColumn<T>, x: number) {
    this.resizeColumn = col;
    this.resizeStart = x;
  }

  private endResize(x: number): TableColumn<T> | undefined {
    if (!this.resizeColumn) {
      return;
    }

    const col = this.resizeColumn;
    this.resizeColumn = undefined;

    col.width = (col.width ?? 160) + (x - this.resizeStart);

    this.requestUpdate();

    return col;
  }

  private onPointerDown(evt: MouseEvent, col: TableColumn<T>) {
    this.startResize(col, Math.floor(evt.clientX));
  }

  private onPointerMove(evt: MouseEvent) {
    if (!this.resizeColumn) {
      return;
    }

    this.requestResize(Math.floor(evt.clientX));
  }

  private onPointerUp(evt: MouseEvent) {
    this.endResize(evt.clientX);
  }

  private onSortHandleDown(evt: Event) {
    const target = evt.target;
    if (target instanceof HTMLElement === false) {
      throw new Error('invalid element');
    }
    const tr = target.closest('tr');
    tr?.setAttribute('draggable', 'true');
  }

  private renderSortHandleCell() {
    if (!this.sortable) {
      return;
    }

    return html`
      <td>
        <span
          class="sort-handle"
          @pointerdown=${this.onSortHandleDown}
        >
        &#x2630;
        </span>
      </td>
    `;
  }

  private renderSelectHandleCell(selected: boolean, item: T, index: number) {
    if (!this.selectable) {
      return;
    }

    return html`
      <td>
        <input type="checkbox"
          id=${`cTableItemSelect_${index}`}
          class="form-check-input"
          .checked=${selected}
          @change=${(evt: Event) => this.onSelectChange(evt, item)}
        >
      </td>
    `;
  }

  private renderItem(item: T, index: number) {
    const selected = this._selectedItems.includes(item);
    const selectedClass = selected ? 'table-active' : '';
    const draggingClass = item === this.draggingItem ? 'table-info' : '';
    return html`
      <tr
        class="${selectedClass} ${draggingClass}"
        part="${this.rowPartGenerator?.(item) ?? ''}"
        data-index="${index}"
      >
        ${this.renderSortHandleCell()}
        ${this.renderSelectHandleCell(selected, item, index)}
        ${this.columns.map((col) => this.renderColumnCell(col, item))}
        <td></td>
        ${this.renderRowTail(item, index)}
      </tr>
    `;
  }

  private renderRowTail(item: T, index: number) {
    return this.tailCellRenderer
      ? this.tailCellRenderer(item, index)
      : html`
        <td class="p-0"></td>
      `;
  }

  private onSelectChange(evt: Event, item: T) {
    const target = evt.target as HTMLInputElement;
    this._selectedItems = target.checked
      ? [...this._selectedItems, item]
      : this._selectedItems.filter((it) => it !== item);

    this.dispatchEvent(
      new CustomEvent('selected-change', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  private renderColumnCell(col: TableColumn<T>, item: T): unknown {
    if (col.renderer) {
      return col.renderer(item, col.name);
    }

    const value = getValue(item, col.name);
    const valueClass = isNullish(value) ? 'text-muted' : 'value';

    return html`
      <td>
        <div class="text-nowrap text-truncate ${alignClass(col.align)} ${valueClass}">
          ${value ?? '--'}
        </div>
      </td>
    `;
  }
}

function alignClass(align?: TableColumnAlign) {
  return `text-${align ?? 'start'}`;
}

function isNullish(value: unknown) {
  return value === undefined || value === null;
}

function getValue<T>(item: T, name: string): unknown {
  const segments = name.split('.');
  let value: unknown = item;
  for (const segment of segments) {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    value = (value as { [key: string]: unknown })[segment];
  }
  return value;
}
