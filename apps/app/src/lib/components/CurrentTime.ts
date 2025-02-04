import { LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

type FormatFn = (time: Date) => string;

@customElement('c-current-time')
export class CurrentTime extends LitElement {
  @property({ attribute: false })
  public format: FormatFn = formatDateTime;

  @state()
  private time = new Date();

  private timeoutHandle = 0;

  connectedCallback(): void {
    super.connectedCallback();

    const updateTime = () => {
      this.time = new Date();
      this.timeoutHandle = setTimeout(updateTime, 1000);
    };

    updateTime();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();

    clearTimeout(this.timeoutHandle);
  }

  protected render(): unknown {
    return this.format ? this.format(this.time) : formatTimeOnly(this.time);
  }
}

export function formatTimeOnly(time: Date) {
  const hh = String(time.getHours()).padStart(2, '0');
  const mm = String(time.getMinutes()).padStart(2, '0');
  const ss = String(time.getSeconds()).padStart(2, '0');

  return `${hh}:${mm}:${ss}`;
}

export function formatDateOnly(time: Date) {
  const yyyy = time.getFullYear();
  const mm = String(time.getMonth() + 1).padStart(2, '0');
  const dd = String(time.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function formatDateTime(time: Date) {
  return `${formatDateOnly(time)} ${formatTimeOnly(time)}`;
}
