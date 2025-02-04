import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

type Variant = 'primary' | 'secondary' | 'danger' | 'success';

interface ToastOpts {
  variant?: Variant;
  duration?: number;
}

@customElement('c-toast')
export class Toast extends LitElement {
  message = '';
  variant: Variant = 'primary';
  duration = 5000;

  static open(message: string, opts: ToastOpts = {}) {
    const toast = new Toast();
    toast.message = message;
    toast.variant = opts.variant ?? toast.variant;
    toast.duration = opts.duration ?? toast.duration;
    getContainer().appendChild(toast);
    return toast;
  }

  static error(err: unknown, opts: ToastOpts = {}) {
    return Toast.open(err instanceof Error ? err.message : `${err}`, {
      ...opts,
      variant: 'danger',
    });
  }

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  connectedCallback(): void {
    super.connectedCallback();

    if (this.duration) {
      setTimeout(() => this.close(), this.duration);
    }
  }

  protected render(): unknown {
    return html`
      <div class="toast show align-items-center text-bg-${this.variant} border-0 m-3"
        role="alert" aria-live="assertive" aria-atomic="true"
      >
        <div class="d-flex">
          <div class="toast-body">
            ${this.message}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto"
            aria-label="Close"
            @click=${this.onClose}
          ></button>
        </div>
      </div>
    `;
  }

  private onClose() {
    this.close();
  }

  close() {
    this.parentElement?.removeChild(this);
  }
}

let container: HTMLElement;
function getContainer(): HTMLElement {
  if (!container) {
    container = document.createElement('div');
    container.classList.add(
      'toast-container',
      'position-fixed',
      'bottom-0',
      // 'start-0',
      'start-50',
      'translate-middle-x',
    );
    document.body.appendChild(container);
  }

  return container;
}
