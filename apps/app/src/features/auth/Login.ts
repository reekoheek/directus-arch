import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '@lib/fields/TextField.js';
import '@lib/components/Button.js';
import { RecordField } from '@lib/fields/RecordField.js';
import { Toast } from '@lib/components/Toast.js';
import { auth } from '../../runtime/auth.js';
import { BasePage } from '@lib/fw/BasePage.js';
import logo from '@runtime/img/lumba.png';
import { t } from '../../runtime/i18n.js';

interface LoginCredential {
  username: string;
  password: string;
}

@customElement('a-login')
export class Login extends BasePage {
  protected pageLayout = 'full';
  protected pageTitle = t('Login');

  @state()
  private submitting = false;

  protected render(): unknown {
    return html`
      <div class="v-full d-flex align-items-center justify-content-center">
        <div class="p-3" style="width: 100%; max-width: 600px">
          <div class="mb-5 text-center">
            <img src=${logo} alt="App" width="230">
          </div>

          <form @submit=${this.onSubmit}>
            <f-record-field>
              <div class="mb-3">
                <f-text-field
                  name="username"
                  label=${t('Username')}
                  required
                ></f-text-field>
              </div>

              <div class="mb-3">
                <f-text-field type="password"
                  name="password"
                  label=${t('Password')}
                  required
                ></f-text-field>
              </div>
            </f-record-field>

            <div class="mb-3">
              <c-button
                variant="primary"
                type="submit"
                ?processing=${this.submitting}
                label=${t('Login')}
                icon="key"
              ></c-button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  private async onSubmit(evt: Event) {
    evt.preventDefault();

    const record = RecordField.of<LoginCredential>(evt.target);

    if (!record.validate()) {
      return;
    }

    const model = record.value;
    if (!model) {
      return;
    }

    this.submitting = true;
    try {
      await auth.login(model.username, model.password);
      Toast.open(t('Welcome'));
      const redirectTo = this.router.ctx.query.redirect ?? '/';
      this.router.push(redirectTo);
    } catch (err) {
      console.error('submit err:', err);
      Toast.open(t('Unauthorized'), { variant: 'danger' });
    } finally {
      this.submitting = false;
    }
  }
}
