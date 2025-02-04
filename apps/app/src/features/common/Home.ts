import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { BasePage } from '@lib/fw/BasePage.js';

@customElement('a-home')
export class Home extends BasePage {
  protected render(): unknown {
    return html`
      <div class="container-fluid pt-3">
        <h1> Home </h1>
      </div>
    `;
  }
}
