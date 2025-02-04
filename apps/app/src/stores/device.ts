import { readItem } from '@directus/sdk';
import { createStaticClient } from './directusClient.js';

class Device {
  private cpId?: string;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  private cpData: any;

  get checkpointData() {
    if (!this.cpData) {
      throw new Error('undefined checkpoint');
    }
    return this.cpData;
  }

  get checkpointId(): string {
    if (this.cpId === undefined) {
      this.cpId = localStorage.getItem('checkpoint') ?? '';
    }

    if (!this.cpId) {
      throw new Error('undefined checkpoint id');
    }

    return this.cpId;
  }

  set checkpointId(checkpoint: string) {
    if (!checkpoint) {
      throw new Error('invalid checkpoint id');
    }

    this.cpId = checkpoint;
    localStorage.setItem('checkpoint', checkpoint);
  }

  async initialize() {
    if (this.cpData) {
      return;
    }

    const client = createStaticClient();
    this.cpData = await client.request(readItem('checkpoint', this.checkpointId));
  }
}

export const device = new Device();
