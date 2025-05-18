import '@lib/fields/RecordField.js';
import { state } from 'lit/decorators.js';
import '@lib/components/Button.js';
import { BasePage } from './BasePage.js';

export abstract class BaseShow<T = Record<string, unknown>> extends BasePage {
  @state()
  protected value?: T;

  protected abstract load(): Promise<T | undefined>;

  async routeCallback() {
    await this.requestLoad();
  }

  protected async requestLoad() {
    this.value = await this.load();
  }
}
