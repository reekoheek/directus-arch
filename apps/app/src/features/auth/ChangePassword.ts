import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '@lib/fields/TextField.js';
import '@lib/components/Button.js';
import { RecordField } from '@lib/fields/RecordField.js';
import { Toast } from '@lib/components/Toast.js';
import { auth } from '@stores/auth.js';
import { BasePage } from '@lib/fw/BasePage.js';
import type { Rule } from '@lib/fields/Rule.js';
import { directusClient } from '@stores/directusClient.js';
import { updateMe } from '@directus/sdk';
import logo from '@stores/img/lumba.png';
import { t } from '@stores/i18n.js';

@customElement('a-change-password')
export class ChangePassword extends BasePage {
  protected pageLayout = 'full';
  protected pageTitle = t('Change Password');

  @property()
  protected username = '';

  @property()
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  protected value: any;

  @property()
  protected errors = {};

  @state()
  private submitting = false;

  connectedCallback(): void {
    super.connectedCallback();

    this.username = this.router.ctx.query.username ?? '';
    this.value = { username: this.username };
  }

  protected render(): unknown {
    return html`
      <div class="v-full d-flex align-items-center justify-content-center">
        <div class="p-3" style="width: 100%; max-width: 400px">
          <div class="mb-5 text-center">
            <img src=${logo} alt="App" width="230">
          </div>
          
          <form @submit=${this.onSubmit}>
            <f-record-field 
              .value=${this.value}
              .errors=${this.errors}
              @mutate=${this.onMutate}
            >
              <div class="mb-3">
                <f-text-field
                  name="username"
                  label=${t('Username')}
                  ?disabled=${Boolean(this.username)}
                ></f-text-field>
              </div>

              <div class="mb-3">
                <f-text-field type="password"
                  name="old_password"
                  label=${t('Old Password')}
                  required
                ></f-text-field>
              </div>

              <div class="mb-3">
                <f-text-field type="password"
                  name="password"
                  label=${t('New Password')}
                  required
                ></f-text-field>
              </div>

              <div class="mb-3">
                <f-text-field type="password"
                  name="confirm_password"
                  label=${t('Confirm Password')}
                  required
                  .rules=${[this.ruleConfirmPassword()]}
                ></f-text-field>
              </div>
            </f-record-field>

            <div class="mb-3">
              <c-button
                variant="primary"
                type="submit"
                ?processing=${this.submitting}
                label=${t('Change Password')}
                icon="key"
              ></c-button>

              <button type="button" class="btn btn-secondary" @click=${() => history.back()}>${t('Back')}</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  private onMutate(evt: Event) {
    const target = evt.target as RecordField;
    this.value = { ...target.value };
    this.errors = target.errors;
  }

  private ruleConfirmPassword<T>(): Rule<T> {
    return (value) => {
      if (value !== this.value?.password) {
        return t('password not match');
      }
    };
  }

  private async onSubmit(evt: Event) {
    evt.preventDefault();

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const record = RecordField.of<any>(evt.target);

    if (!record.validate()) {
      return;
    }

    const model = record.value;

    if (!model) {
      return;
    }

    this.submitting = true;
    try {
      await auth.login(model.username, model.old_password);
      const key = auth.claims()?.id;
      if (!key) {
        throw new Error('invalid user id');
      }

      await directusClient.request(
        updateMe({
          password: model.password,
        }),
      );

      Toast.open(t('Welcome'));
      const redirectTo = this.router.ctx.query.redirect ?? '/';
      location.href = redirectTo;
    } catch (err) {
      console.error('submit err:', err);
      Toast.open(t('Unauthorized'), { variant: 'danger' });
    } finally {
      this.submitting = false;
    }
  }
}
