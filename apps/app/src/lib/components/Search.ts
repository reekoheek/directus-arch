import { debounce } from '@lib/utils/debounce.js';
import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('c-search')
export class Search extends LitElement {
  @property()
  public placeholder = 'Search...';

  @property()
  public value = '';

  private debounceSearch = debounce(() => this.search(), 1000);

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  protected render(): unknown {
    return html`
      <form @submit=${this.onSubmit}>
        <input type="search"
          id="cSearchInput"
          class="form-control"
          placeholder=${this.placeholder}
          .value=${this.value ?? ''}
          @input=${this.onInput}
        >
      </form>
    `;
  }

  private onSubmit(evt: Event) {
    evt.preventDefault();

    this.search();
  }

  private onInput(evt: Event) {
    evt.stopImmediatePropagation();

    this.value = (evt.target as HTMLInputElement).value;

    this.debounceSearch();
  }

  private search() {
    this.debounceSearch.clear();

    this.dispatchEvent(
      new CustomEvent('search', {
        bubbles: true,
        composed: true,
      }),
    );
  }
}
