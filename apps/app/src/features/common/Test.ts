import { customElement } from 'lit/decorators.js';
import { BaseForm } from '@lib/fw/BaseForm.js';
import { html } from 'lit';
import '@lib/fields/TextField.js';

// setTimeout(() => {
//   console.log('load');
//   import('@lib/fields/TextField.js');
// }, 300);

@customElement('a-test')
export class Test extends BaseForm {
  protected renderLayout(): unknown {
    return html`
      <div class="row mb-3">
        <div class="col">
          <f-text-field
            name="foo"
            label="Foo"
          ></f-text-field>
        </div>
      </div>

      <div class="row mb-3">
        <div class="col">
          <f-text-field
            name="bar"
            label="Bar"
          ></f-text-field>
        </div>
      </div>
    `;
  }

  protected async load(): Promise<Record<string, unknown> | undefined> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      foo: 'foo',
      bar: 'bar',
    };
  }

  protected async submit(value: Record<string, unknown>): Promise<Record<string, string>> {
    console.info(value);
    return {
      foo: 'xxx',
    };
  }
}
