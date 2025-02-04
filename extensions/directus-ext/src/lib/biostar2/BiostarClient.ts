import { BiostarError, HttpError } from './BiostarError.js';
import type { BiostarRequest } from './BiostarRequest.js';
import { WebSocket } from 'ws';

export type ResultMapper<TResult> = (resp: Response) => TResult | Promise<TResult>;
export type ErrorMapper = (err: HttpError) => BiostarError | Promise<BiostarError>;

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
  rejectUnauthorized?: boolean;
  keepAliveInterval?: number;
}

export class BiostarClient {
  public subscribers: SubscribeFn<unknown>[] = [];
  private sessionId?: string;
  private ws?: WebSocket;
  private _keepAliveT: unknown = 0;
  private opts: Required<BiostarClientOpts>;

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

  stopListening() {
    try {
      this.ws?.close();
    } catch {}
    this.ws = undefined;
  }

  startListening() {
    if (this.ws) {
      return;
    }

    const wsUrl = `wss://${this.opts.host}/wsapi`;
    this.ws = new WebSocket(wsUrl, {
      rejectUnauthorized: this.opts.rejectUnauthorized,
    });

    this.ws.on('error', (err) => {
      console.error('ws error', err);
      this.ws?.close();
    });

    this.ws.on('close', () => {
      this.ws = undefined;
    });

    this.ws.on('open', () => {
      console.info('biostar client: listen event with session', this.sessionId);
      this.ws?.send(`bs-session-id=${this.sessionId}`);
    });

    this.ws?.on('message', async (data) => {
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

        console.info('biostar client: event listening started');
        return;
      }

      for (const fn of this.subscribers) {
        try {
          fn(payload);
        } catch (err) {
          console.error('biostar client subscriber error', err);
        }
      }
    });
  }

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  subscribe<T = any>(fn: SubscribeFn<T>): () => void {
    if (!this.ws && this.loggedIn) {
      this.startListening();
    }

    this.subscribers.push(fn as SubscribeFn<unknown>);

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

  get loggedIn() {
    return Boolean(this.sessionId);
  }

  private apiUrl(path: string) {
    return `https://${this.opts.host}/api${path}`;
  }

  async login(loginId: string, password: string, keepAlive = false) {
    const resp = await fetch(this.apiUrl('/login'), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        User: {
          login_id: loginId,
          password,
        },
      }),
    });

    if (!resp.ok) {
      throw new BiostarError('unauthorized', 401);
    }

    const sessionId = resp.headers.get('bs-session-id');
    if (!sessionId) {
      throw new Error('bs-session-id not found');
    }
    this.sessionId = sessionId;

    if (this.subscribers.length > 0) {
      this.startListening();
    }

    if (keepAlive) {
      this.startKeepAlive();
    }
  }

  private startKeepAlive() {
    const keepAliveCheck = async () => {
      console.info(new Date().toJSON(), 'biostar keepalive check');
      await this.request({
        method: 'GET',
        url: '/users?limit=1',
      });
      this._keepAliveT = setTimeout(keepAliveCheck, this.opts.keepAliveInterval);
    };
    this._keepAliveT = setTimeout(keepAliveCheck, this.opts.keepAliveInterval);
  }

  async logout() {
    clearTimeout(this._keepAliveT as number);
    await this.request({
      method: 'POST',
      url: '/logout',
    });

    this.sessionId = undefined;
  }

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  async request<TResult = any>(config: BiostarRequest<TResult>): Promise<TResult> {
    const resultMapper = config.mapResult ?? DEFAULT_RESULT_MAPPER;
    const errorMapper = config.mapError ?? DEFAULT_ERROR_MAPPER;

    try {
      if (!this.sessionId) {
        throw new BiostarError('unauthorized', 401);
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
      if (err instanceof HttpError === false) {
        throw err;
      }

      if (err.response.status === 401) {
        throw new BiostarError('unauthorized', 401);
      }

      const mappedErr = await errorMapper(err);
      throw mappedErr;
    }
  }
}
