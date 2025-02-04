import { nanoid } from 'nanoid';

interface Message {
  type: string;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  payload: any;
  id?: string;
}

type TokenFn = () => string;

interface SubscriptionFilter {
  name?: string[];
  collection?: string[];
  key?: string[];
}

interface RealtimeEvent {
  name: string;
  collection: string;
  key: string;
}

type SubscriptionCallback = (evt: RealtimeEvent) => unknown;

export interface Subscription {
  id: string;
  filter?: SubscriptionFilter;
  callback: SubscriptionCallback;
}

export interface RealtimeOpts {
  url: string;
  token: string | TokenFn;
}

export class Realtime {
  private ws?: WebSocket;
  private subscriptions: Subscription[] = [];

  get connected() {
    return Boolean(this.ws);
  }

  constructor(private readonly opts: RealtimeOpts) {}

  async connect() {
    if (this.ws) {
      return;
    }

    await new Promise<void>((resolve, reject) => {
      let tryConnecting = true;

      const wsUrl = this.opts.url;

      console.info('realtime connecting to', wsUrl);

      const ws = new WebSocket(wsUrl);

      ws.addEventListener('open', () => {
        ws.send(JSON.stringify({ type: 'connect', payload: this.token() }));
      });

      ws.addEventListener('message', async (evt) => {
        const message: Message = JSON.parse(evt.data);

        if (message.type === 'connected') {
          this.ws = ws;
          tryConnecting = false;

          for (const sub of this.subscriptions) {
            this.send({ type: 'subscribe', id: sub.id, payload: sub.filter });
          }
          resolve();
          return;
        }

        if (message.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong', payload: this.token() }));
          return;
        }

        if (message.type === 'event') {
          const sub = this.subscriptions.find((s) => s.id === message.id);
          if (sub) {
            sub.callback(message.payload);
          }
          return;
        }

        console.info('message', message);
      });

      ws.addEventListener('error', () => {
        console.error('error');
      });

      ws.addEventListener('close', async () => {
        if (tryConnecting) {
          reject(new Error('try connecting failed'));
          return;
        }

        this.ws = undefined;
        console.info('realtime disconnected');
      });
    });
  }

  private send(message: Message) {
    this.ws?.send(JSON.stringify(message));
  }

  disconnect() {
    this.ws?.close();
  }

  destroy() {
    this.disconnect();
  }

  subscribe(filter: SubscriptionFilter, callback: SubscriptionCallback) {
    const sub = {
      id: nanoid(),
      filter,
      callback,
    };

    this.subscriptions.push(sub);

    if (this.connected) {
      this.send({ type: 'subscribe', id: sub.id, payload: sub.filter });
    }

    return () => {
      this.subscriptions = this.subscriptions.filter((s) => s !== sub);
    };
  }

  private token(): string {
    const token = this.opts.token;
    return typeof token === 'string' ? token : token();
  }
}
