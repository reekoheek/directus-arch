import { createStore } from '../lib/directus/createStore.js';
import { EventBus } from '../lib/fw/EventBus.js';

export const BIOSTAR_HOST = process.env.APP_BIOSTAR_HOST ?? 'localhost';
export const BIOSTAR_LOGINID = process.env.APP_BIOSTAR_LOGINID ?? 'admin';
export const BIOSTAR_PASSWORD = process.env.APP_BIOSTAR_PASSWORD ?? '';

export const lookupEventBus = createStore(
  'eventBus',
  async () => {
    const eventBus = new EventBus();
    return eventBus;
  },
  async (promised) => {
    const eventBus = await promised;
    eventBus.destroy();
  },
);
