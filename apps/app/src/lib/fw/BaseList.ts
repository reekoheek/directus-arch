import type { Button } from '@lib/components/Button.js';
import '@lib/components/Table.js';
import { Toast } from '@lib/components/Toast.js';
import { html } from 'lit';
import { state } from 'lit/decorators.js';
import '@lib/components/Search.js';
import '@lib/components/Button.js';
import type { Query, QueryResult } from './Query.js';
import { BasePage } from './BasePage.js';
import type { ItemAction } from './ItemAction.js';
import type { ListAction } from './ListAction.js';
import type { BulkAction } from './BulkAction.js';

export abstract class BaseList<T extends object = Record<string, unknown>> extends BasePage {
  protected pageTitle = 'List';

  protected loadingLabel = 'Loading...';

  protected abstract renderTableColumns(): unknown;
  protected abstract load(query: Query): Promise<QueryResult<T>>;

  protected query: Query = {};

  @state()
  protected actions: ListAction[] = [];

  @state()
  protected itemActions: ItemAction<T>[] = [];

  @state()
  protected bulkActions: BulkAction<T>[] = [];

  @state()
  protected items?: T[];

  @state()
  private count?: number;

  @state({
    hasChanged: (value?: T[], oldValue?: T[]) => {
      if (!value?.length && !oldValue?.length) {
        return false;
      }

      return value !== oldValue;
    },
  })
  private selectedItems: T[] = [];

  async routeCallback() {
    await super.routeCallback();

    this.query = toQuery(this.router.ctx.query);

    await this.requestLoad();
  }

  protected render<TItem extends T>(): unknown {
    if (this.items === undefined) {
      return;
    }

    const renderTailCell = this.itemActions.length
      ? (item: TItem, index: number) => this.renderItemActions(item, index)
      : undefined;

    return html`
      <div class="container-fluid pt-3">
        <div class="d-flex mb-3">
          <div class="flex-grow-1">
            <h1 class="m-0">
              ${this.pageTitle ?? ''}
            </h1>
          </div>
          <div>
            ${this.renderActions()}
          </div>
        </div>

        ${this.renderToolbar()}

        <div class="mb-3">
          <c-table
            ?selectable=${this.bulkActions.length !== 0}
            striped
            .items=${this.items}
            @selected-change=${this.onSelectedChange}
            .tailCellRenderer=${renderTailCell}
          >
            ${this.renderTableColumns()}
          </c-table>
        </div>
      </div>
    `;
  }

  protected renderToolbar(): unknown {
    return html`
      <div class="d-flex mb-3">
        <div class="flex-grow-1">
          <div ?hidden=${!this.selectedItems.length}>
            ${this.renderBulkActions()}
          </div>
        </div>

        ${this.renderInfo()}
        ${this.renderSearch()}
      </div>
    `;
  }

  protected renderInfo(): unknown {
    return html`
      <div class="me-3 d-flex align-items-center">
        ${this.items?.length ?? 0} ${this.count ? ` of ${this.count}` : ''} items
      </div>
    `;
  }

  protected renderItemActions(item: T, index: number): unknown {
    return html`
      <td>
        <span class="text-nowrap">
          ${this.itemActions?.map((action) => this.renderItemAction(action, item, index))}
        </span>
      </td>
    `;
  }

  protected renderItemAction(action: ItemAction<T>, item: T, index: number) {
    const variantClass = `text-${action.variant ?? 'secondary'}`;
    if ('link' in action) {
      return html`
        <a
          href=${action.link(item, index)}
          class="btn btn-link p-0"
          title=${action.label ?? ''}
        >
          <span class="bi bi-${action.icon} ${variantClass}"></span>
        </a>
      `;
    }

    return html`
      <button
        type="button"
        class="btn btn-link p-0"
        @click=${(evt: Event) => this.onItemActionClick(evt, action, item, index)}
        title=${action.label ?? ''}
      >
        <span class="bi bi-${action.icon} ${variantClass}"></span>
      </button>
    `;
  }

  protected renderActions(): unknown {
    return this.actions.map((action) => {
      const variantClass = `btn-${action.variant ?? 'secondary'}`;

      if ('link' in action) {
        return html`
          <a
            href=${action.link()}
            class="btn btn-lg ${variantClass}"
            title=${action.label ?? ''}
          >
            <span class="bi bi-${action.icon}"></span>
            ${action.label}
          </a>
        `;
      }

      return html`
        <button
          type="button"
          class="btn ${variantClass}"
          @click=${(evt: Event) => this.onActionClick(evt, action)}
          title=${action.label ?? ''}
        >
          <span class="bi bi-${action.icon}"></span>
          ${action.label}
        </button>
      `;
    });
  }

  private async onItemActionClick(evt: Event, action: ItemAction<T>, item: T, index: number) {
    evt.stopImmediatePropagation();

    if ('execute' in action === false) {
      return;
    }

    const target = evt.currentTarget as Button;
    target.processing = true;

    try {
      await action.execute(item, index);
      await this.requestLoad();
    } catch (err) {
      this.errorCallback(err);
    } finally {
      target.processing = false;
    }
  }

  private async onActionClick(evt: Event, action: ListAction) {
    evt.stopImmediatePropagation();

    if ('execute' in action === false) {
      return;
    }

    const target = evt.currentTarget as Button;
    target.processing = true;

    try {
      await action.execute();
      await this.requestLoad();
    } catch (err) {
      this.errorCallback(err);
    } finally {
      target.processing = false;
    }
  }

  protected renderSearch(): unknown {
    return html`
      <div>
        <c-search .value=${this.query.search ?? ''} @search=${this.onSearch}></c-search>
      </div>
    `;
  }

  protected renderBulkActions(): unknown {
    return this.bulkActions.map(
      (action) => html`
      <c-button
        variant=${action.variant ?? 'secondary'}
        label=${action.label ?? ''}
        icon=${action.icon ?? ''}
        @click=${(evt: Event) => this.onBulkActionClick(evt, action)}
      >
      </c-button>
    `,
    );
  }

  protected async onBulkActionClick(evt: Event, action: BulkAction<T>) {
    evt.stopImmediatePropagation();

    if (this.selectedItems.length === 0) {
      return;
    }

    const target = evt.currentTarget as Button;
    target.processing = true;

    try {
      await action.execute(this.selectedItems);
      await this.requestLoad();
    } catch (err) {
      const message = err instanceof Error ? err.message : `${err}`;
      Toast.open(message, { variant: 'danger' });
    } finally {
      target.processing = false;
    }
  }

  private onSelectedChange(evt: Event) {
    this.selectedItems = (evt.target as unknown as { selectedItems: T[] }).selectedItems;
  }

  private onSearch(evt: Event) {
    const search = (evt.target as HTMLInputElement).value || undefined;
    if (this.query.search === search) {
      return;
    }

    this.query.search = search;

    this.router.replace(search ? `?_search=${search}` : '?', true);

    this.requestLoad();
  }

  async requestLoad() {
    const toast = Toast.open(this.loadingLabel, { variant: 'secondary' });
    try {
      const { items, count } = await this.load(this.query);
      this.items = items;
      this.count = count;
      toast.close();
    } catch (err) {
      console.error(err);
      toast.close();
      this.errorCallback(err);
    }
  }

  protected errorCallback(err: unknown) {
    console.error(err);
    Toast.error(err);
  }
}

function toQuery(urlQuery: Record<string, string>): Query {
  const query: Query = {};

  if (urlQuery._search) {
    query.search = urlQuery._search;
  }

  const filter = { ...urlQuery };
  // biome-ignore lint/performance/noDelete: <explanation>
  delete filter._search;
  if (Object.keys(filter).length !== 0) {
    query.filter = filter;
  }

  return query;
}
