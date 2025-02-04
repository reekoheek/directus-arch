import { html, LitElement } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { Modal } from './Modal.js';
import { delay } from '@lib/utils/delay.js';

@customElement('c-print')
export class Print extends LitElement {
  protected pageTitle = '';

  private ready = false;
  private containerElement?: HTMLElement;

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  async print() {
    await this.prepare();

    const iframe = document.createElement('iframe');
    getContainer().appendChild(iframe);

    await writeDoc(iframe, this.innerHTML);

    const win = iframe.contentWindow;
    if (!win) {
      throw new Error('invalid iframe window');
    }

    win.focus();

    const title = document.title;
    document.title = this.pageTitle || title;
    win.print();
    document.title = title;

    getContainer().removeChild(iframe);
  }

  async preview() {
    await this.prepare();

    const el = new PrintPreview();
    await el.exec(this);
  }

  private async prepare() {
    if (this.ready) {
      return;
    }

    await new Promise<void>((resolve) => {
      const onReady = () => {
        this.containerElement?.removeChild(this);
        resolve();
      };

      this.addEventListener('print-ready', onReady);

      if (!this.isConnected) {
        this.containerElement = document.body;
        this.containerElement.appendChild(this);
      }
    });
  }

  protected firstUpdated() {
    this.ready = true;
    this.dispatchEvent(new CustomEvent('print-ready'));
  }
}

let container: HTMLElement;

function getContainer(): HTMLElement {
  if (!container) {
    container = document.createElement('div');
    container.classList.add('print-container', 'd-none');
    document.body.appendChild(container);
  }

  return container;
}

async function writeDoc(iframe: HTMLIFrameElement, content: string) {
  const win = iframe.contentWindow;
  const doc = iframe.contentDocument;
  if (!win || !doc) {
    throw new Error('no win or doc');
  }

  doc.open();
  doc.write(
    `
    <!DOCTYPE html>
    <html>
      <body>
        ${content}
      </body>
    </html>
    `.trim(),
  );
  doc.close();

  const images = [...doc.getElementsByTagName('img')];
  const loadImagePromises = images.map((img) => new Promise((resolve) => img.addEventListener('load', resolve)));
  const loadPromise = new Promise((resolve) => iframe.addEventListener('load', resolve));

  await Promise.all([...loadImagePromises, doc.fonts.ready, loadPromise]);

  await delay(100);
}

@customElement('c-print-preview')
export class PrintPreview extends Modal {
  @query('iframe')
  iframe!: HTMLIFrameElement;

  private printElement!: Print;

  connectedCallback(): void {
    super.connectedCallback();

    this.size = 'fullscreen';
  }

  protected firstUpdated() {
    writeDoc(this.iframe, this.printElement.innerHTML);
  }

  protected renderBody(): unknown {
    return html`
      <div class="d-flex h-100 justify-content-center align-items-center">
        <div class="h-75 border p-3" style="width: 700px">
          <iframe class="w-100 h-100"></iframe>
        </div>
      </div>
    `;
  }

  async exec(print: Print) {
    this.printElement = print;
    await this.show();
  }
}
