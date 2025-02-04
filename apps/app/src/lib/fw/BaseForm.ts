import { html } from 'lit';
import '@lib/fields/RecordField.js';
import { state } from 'lit/decorators.js';
import { Toast } from '@lib/components/Toast.js';
import '@lib/components/Button.js';
import { BasePage } from './BasePage.js';
import { RecordField } from '@lib/fields/RecordField.js';

export abstract class BaseForm<T = Record<string, unknown>> extends BasePage {
  protected pageTitle = 'Form';
  protected submitLabel = 'Save';
  protected cancelLabel = 'Cancel';

  protected abstract renderLayout(): unknown;
  protected abstract submit(_value: T): Promise<Record<string, string>>;

  private initialValue?: T;

  @state()
  protected value?: T;

  @state()
  private errors: Record<string, string> = {};

  @state()
  private submitting = false;

  get mutatedValue(): Partial<T> {
    if (!this.value) {
      throw new Error('invalid value');
    }

    if (!this.initialValue) {
      return { ...this.value };
    }

    const merged = { ...this.initialValue, ...this.value };

    const result = {} as NonNullable<T>;

    for (const key in merged) {
      const aValue = this.initialValue[key] ?? null;
      const bValue = this.value[key] ?? null;
      if (aValue !== bValue) {
        result[key] = this.value[key];
      }
    }

    return result;
  }

  async routeCallback() {
    await super.routeCallback();
    await this.requestLoad();
  }

  protected async requestLoad() {
    this.value = await this.load();
    this.initialValue = this.value;
  }

  protected load(): Promise<T | undefined> {
    return Promise.resolve(undefined);
  }

  protected render(): unknown {
    return html`
      <div class="container-fluid pt-3">
        <div class="mb-3">
          <h1>
            ${this.pageTitle ?? ''}
          </h1>
        </div>

        ${this.renderToolbar()}

        <form @submit=${this.onFormSubmit}>
          <f-record-field
            .value=${this.value}
            .errors=${this.errors}
            @mutate=${this.onMutate}
          >
            ${this.renderLayout()}
          </f-record-field>

          ${this.renderActions()}
        </form>
      </div>
    `;
  }

  protected renderActions(): unknown {
    return html`
      <div class="mb-3">
        <c-button variant="primary" type="submit"
          icon="floppy"
          label=${this.submitLabel}
          ?processing=${this.submitting}
        ></c-button>
        <c-button @click=${this.onCancel} label=${this.cancelLabel}></c-button>
      </div>
    `;
  }

  protected renderToolbar(): unknown {
    return undefined;
  }

  private onMutate(evt: Event) {
    const target = evt.target as RecordField;
    this.value = {
      ...this.initialValue,
      ...target.value,
    } as T;
    this.errors = target.errors;
  }

  private async onFormSubmit(evt: Event) {
    evt.preventDefault();

    const record = RecordField.of(evt.target);
    if (!record.validate()) {
      return;
    }

    const ok = await this.requestSubmit();
    if (ok) {
      this.close();
    }
  }

  protected async requestSubmit(): Promise<boolean> {
    this.submitting = true;
    try {
      const errors = await this.submit(this.value as T);
      if (Object.keys(errors).length !== 0) {
        this.errors = errors;
        throw new Error('failed submit');
      }

      this.submitting = false;
      return true;
    } catch (err) {
      this.errorCallback(err);
      this.submitting = false;
      return false;
    }
  }

  protected errorCallback(err: unknown) {
    console.error(err);
    Toast.error(err);
  }

  protected onCancel() {
    this.close();
  }

  protected close() {
    this.router.pop();
  }
}
