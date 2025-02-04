import { html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

interface BaseItem {
  variant?: string;
  icon?: string;
  label: string;
  active?(): boolean;
  hidden?(): boolean;
}

interface LinkItem extends BaseItem {
  url: string;
}

interface ButtonItem extends BaseItem {
  onClick(evt: Event): unknown;
}

export type MenuItem = LinkItem | ButtonItem;

export interface MenuGroup {
  label?: string;
  icon?: string;
  items: MenuItem[];
  hidden?(): boolean;
}

function isButtonItem(item: MenuItem): item is ButtonItem {
  return 'onClick' in item;
}

function isLinkItem(item: MenuItem): item is LinkItem {
  return 'url' in item;
}

@customElement('c-menu')
export class Menu extends LitElement {
  @property({ attribute: false })
  private readonly groups: MenuGroup[] = [];

  @state()
  private selected?: MenuItem;

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  connectedCallback(): void {
    super.connectedCallback();

    document.addEventListener('router-dispatch', () => {
      this.selected = undefined;
      this.requestUpdate();
    });
  }

  protected render(): unknown {
    return html`
      <div class="px-3 menu-list" @click=${this.onClick}>
        ${this.groups.map((group) => this.renderLinkGroup(group))}
      </div>
    `;
  }

  private onClick(evt: Event) {
    this.selected = (evt.target as unknown as { item: MenuItem })?.item;
  }

  private renderLinkGroup(group: MenuGroup) {
    if (group.hidden?.()) {
      return;
    }

    const renderTitle = () => {
      if (!group.label) {
        return;
      }

      const iconClass = group.icon ? `bi-${group.icon}` : 'bi-gear';

      return html`
        <div class="menu-group-title px-3 py-2">
          <i class="bi ${iconClass} me-3"></i>
          <strong>
            ${group.label}
          </strong>
        </div>
      `;
    };

    return html`
      <div class="mt-3">
        ${renderTitle()}
        <div class="list-group">
          ${group.items.map((link) => this.renderLink(link))}
        </div>
      </div>
    `;
  }

  private renderLink(item: MenuItem) {
    if (item.hidden?.()) {
      return;
    }

    const active = this.selected !== undefined ? this.selected === item : Boolean(item.active?.());
    const variantClass = item.variant ? `list-group-item-${item.variant}` : '';
    const iconClass = item.icon ? `bi-${item.icon}` : 'bi-gear';

    if (isLinkItem(item)) {
      return html`
        <a href="${item.url}"
          class="list-group-item list-group-item-action ${active ? 'active' : ''} ${variantClass}"
          .item=${item}
        >
          <i class="bi ${iconClass} me-3"></i>
          ${item.label}
        </a>
      `;
    }

    if (isButtonItem(item)) {
      return html`
        <button
          @click=${item.onClick}
          class="list-group-item list-group-item-action ${active ? 'active' : ''} ${variantClass}"
          .item=${item}
        >
          <i class="bi ${iconClass} me-3"></i>
          ${item.label}
        </button>
      `;
    }
  }
}
