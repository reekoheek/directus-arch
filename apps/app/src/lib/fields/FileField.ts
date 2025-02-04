import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Field } from './Field.js';

interface FileFieldOpts {
  accept: string;
  preview: boolean;
  uploadurl: string;
  bucket: string;
}

let defaultOpts: FileFieldOpts = {
  accept: '',
  preview: false,
  uploadurl: '/upload',
  bucket: '/',
};

@customElement('f-file-field')
export class FileField extends Field<string> {
  static setDefaultOptions(opts: Partial<FileFieldOpts>) {
    defaultOpts = {
      ...defaultOpts,
      ...opts,
    };
  }

  @property()
  protected accept = defaultOpts.accept;

  @property({ type: Boolean })
  protected preview = defaultOpts.preview;

  @property()
  protected uploadurl = defaultOpts.uploadurl;

  @property()
  protected bucket = defaultOpts.bucket;

  @property()
  protected headers: Record<string, string> = {};

  @state()
  private status = '';

  @state()
  private previewSrc = '';

  protected renderInput() {
    return html`
      <div>
        <div class="border rounded overflow-hidden mb-3" ?hidden=${this.previewSrc === ''}>
          <img src=${this.previewSrc} class="w-100">
        </div>

        <div class="input-group ${this.error ? 'is-invalid' : ''}">
          <span class="form-control ${this.error ? 'is-invalid' : ''}"
          >
            ${this.status}
          </span>

          <button
            class="btn btn-primary"
            type="button"
            @click=${this.onBrowseClick}
          >
            Browse
          </button>
        </div>
      </div>
    `;
  }

  private onBrowseClick() {
    const fileEl = document.createElement('input');
    fileEl.type = 'file';
    fileEl.accept = this.accept;
    fileEl.click();
    fileEl.addEventListener('change', async () => {
      this.status = 'uploading...';
      const formData = new FormData();
      const files = fileEl.files;
      if (!files) {
        return;
      }
      formData.set('bucket', this.bucket);
      for (const file of files) {
        if (!file) {
          continue;
        }

        if (this.preview) {
          const reader = new FileReader();
          reader.onloadend = () => {
            this.previewSrc = reader.result as string;
          };
          reader.readAsDataURL(file);
        }

        formData.append('file', file);
      }

      try {
        const resp = await fetch(this.uploadurl, {
          method: 'POST',
          headers: {
            ...this.headers,
          },
          body: formData,
        });

        if (!resp.ok) {
          throw new Error(`${resp.status} ${resp.statusText}`);
        }

        const [file] = await resp.json();
        const value = `${file.bucket}/${file.id}/${file.name}`;
        this.updateValue(value);

        this.status = `${file.name} uploaded`;
      } catch (err) {
        console.error('upload err:', err);
        const errMessage = err instanceof Error ? err.message : `${err}`;
        this.error = `uploading error: ${errMessage}`;
        this.status = '';
      }
    });
  }

  protected onMutate(evt: Event) {
    evt.stopImmediatePropagation();
    const target = evt.target as HTMLInputElement;
    this.updateValue(target.value);
  }

  protected onKeyDown(evt: KeyboardEvent) {
    if (evt.key !== 'Enter') {
      return;
    }

    evt.stopImmediatePropagation();
    this.requestFormSubmit();
  }
}
