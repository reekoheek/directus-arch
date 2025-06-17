export interface EventListener<T = object> {
  listen(evt: T): Promise<void>;
}

export class EventBus {
  private listeners: Record<string, EventListener[]> = {};

  destroy() {
    this.listeners = {};
  }

  listen(name: string, listener: EventListener) {
    this.listeners[name] = this.listeners[name] ?? [];

    this.listeners[name].push(listener);
  }

  async dispatch(evt: object) {
    const name = evt.constructor.name;

    const listeners = [...(this.listeners[name] ?? []), ...(this.listeners['*'] ?? [])];

    for (const listener of listeners) {
      await listener.listen(evt);
    }
  }
}
