import { BiostarError, HttpError } from './BiostarError.js';
import type { BiostarRequest } from './BiostarRequest.js';
import { WebSocket } from 'ws';
import debugModule from 'debug';

const log = debugModule('lib:biostar:log');
log.enabled = true;

export type ResultMapper<TResult> = (resp: Response) => TResult | Promise<TResult>;
export type ErrorMapper = (err: unknown) => BiostarError | Promise<BiostarError>;

export type SubscribeFn<T> = (data: T) => void;

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const DEFAULT_RESULT_MAPPER: ResultMapper<any> = async (resp) => {
  const data = await resp.json();
  return data;
};

const DEFAULT_ERROR_MAPPER: ErrorMapper = async (err) => {
  if (err instanceof HttpError) {
    const data = await err.response.json();
    return new BiostarError(data.Response.message, err.response.status, data);
  }

  throw err;
};

const DEFAULT_KEEPALIVE_INTERVAL = 30 * 60 * 1000;

interface BiostarClientOpts {
  host: string;
  loginId: string;
  password: string;
  rejectUnauthorized?: boolean;
  keepAliveInterval?: number;
}

type ConnectedCallback = () => unknown;

export class BiostarClient {
  public subscribers: SubscribeFn<unknown>[] = [];
  private sessionId?: string;
  private ws?: WebSocket;
  private _keepAliveT: unknown = 0;
  private opts: Required<BiostarClientOpts>;
  private connectedCallback?: ConnectedCallback;

  get connected() {
    return Boolean(this.sessionId);
  }

  constructor(opts: BiostarClientOpts) {
    this.opts = {
      rejectUnauthorized: true,
      keepAliveInterval: DEFAULT_KEEPALIVE_INTERVAL,
      ...opts,
    };

    if (!this.opts.rejectUnauthorized) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    }
  }

  onConnected(cb: ConnectedCallback) {
    this.connectedCallback = cb;
  }

  async connect() {
    await this.login();

    if (this.subscribers.length > 0) {
      this.startListening();
    }

    if (this.opts.keepAliveInterval) {
      this.startKeepAlive();
    }

    log('connected');

    await this.connectedCallback?.();
  }

  async disconnect() {
    this.stopKeepAlive();
    this.stopListening();
    await this.logout();
    log('disconnected');
  }

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  async request<TResult = any>(config: BiostarRequest<TResult>): Promise<TResult> {
    const resultMapper = config.mapResult ?? DEFAULT_RESULT_MAPPER;
    const errorMapper = config.mapError ?? DEFAULT_ERROR_MAPPER;

    try {
      if (!this.sessionId) {
        throw new BiostarError('unauthorized');
      }

      const fetchOptions = {
        ...config,
        headers: {
          'content-type': 'application/json',
          'bs-session-id': this.sessionId,
          ...config.headers,
        },
        body: config.body ? JSON.stringify(config.body) : undefined,
      };

      const resp = await fetch(this.apiUrl(config.url), fetchOptions);

      if (!resp.ok) {
        throw new HttpError(resp);
      }

      const result = await resultMapper(resp);

      return result;
    } catch (err) {
      const mappedErr = await errorMapper(err);
      throw mappedErr;
    }
  }

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  subscribe<T = any>(fn: SubscribeFn<T>): () => void {
    this.subscribers.push(fn as SubscribeFn<unknown>);

    if (!this.ws && this.connected) {
      this.startListening();
    }

    return () => {
      const index = this.subscribers.indexOf(fn as SubscribeFn<unknown>);
      if (index !== -1) {
        this.subscribers.splice(index, 1);
      }
      if (this.subscribers.length === 0) {
        this.stopListening();
      }
    };
  }

  private startListening() {
    if (this.ws) {
      return;
    }

    const wsUrl = `wss://${this.opts.host}/wsapi`;
    this.ws = new WebSocket(wsUrl, {
      rejectUnauthorized: this.opts.rejectUnauthorized,
    });

    this.ws.on('error', (err: unknown) => {
      log('ws error', err);
      this.ws?.close();
      this.handleError(new Error('ws failed'));
    });

    this.ws.on('close', () => {
      this.ws = undefined;
    });

    this.ws.on('open', () => {
      log('listen event with session', this.sessionId);
      this.ws?.send(`bs-session-id=${this.sessionId}`);
    });

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    this.ws?.on('message', async (data: any) => {
      const payload = JSON.parse(data.toString());

      if (payload.Response && payload.Response.code === '0') {
        const data = await this.request({
          url: '/events/start',
          method: 'POST',
        });

        if (data.Response.code !== '0') {
          this.ws?.close();
          throw new Error('failure to start events');
        }

        log('event listening started');
        return;
      }

      for (const fn of this.subscribers) {
        try {
          fn(payload);
        } catch (err) {
          log('subscriber error', err);
        }
      }
    });
  }

  private stopListening() {
    if (!this.ws) {
      return;
    }

    try {
      this.ws.close();
    } finally {
      this.ws = undefined;
    }
  }

  private apiUrl(path: string) {
    return `https://${this.opts.host}/api${path}`;
  }

  private async login() {
    const resp = await fetch(this.apiUrl('/login'), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        User: {
          login_id: this.opts.loginId,
          password: this.opts.password,
        },
      }),
    });

    if (!resp.ok) {
      throw new BiostarError('unauthorized', 400);
    }

    const sessionId = resp.headers.get('bs-session-id');
    if (!sessionId) {
      throw new Error('bs-session-id not found');
    }
    this.sessionId = sessionId;
  }

  private async logout() {
    if (!this.sessionId) {
      return;
    }

    try {
      this.sessionId = undefined;
      await this.request({
        method: 'POST',
        url: '/logout',
      });
    } catch {
      // noop
    }
  }

  private startKeepAlive() {
    const keepAliveCheck = async () => {
      log('biostar keepalive check');
      try {
        await this.request({
          method: 'GET',
          url: '/users?limit=1',
        });
        this._keepAliveT = setTimeout(keepAliveCheck, this.opts.keepAliveInterval);
      } catch {
        this.handleError(new Error('keepalive failed'));
      }
    };
    this._keepAliveT = setTimeout(keepAliveCheck, this.opts.keepAliveInterval);
  }

  private stopKeepAlive() {
    clearTimeout(this._keepAliveT as number);
  }

  private async handleError(err: unknown) {
    const message = err instanceof Error ? err.message : `${err}`;
    log('client reconnecting caused by:', message);

    while (true) {
      try {
        await this.disconnect();
        await new Promise((resolve) => setTimeout(resolve, 3000));
        await this.connect();
        return;
      } catch {
        log('retry reconnecting');
      }
    }
  }
}
