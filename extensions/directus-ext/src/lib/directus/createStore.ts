// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type FactoryFn<T> = (ctx: any, ...rest: any[]) => T;
type DisposeFn<T> = (store: T) => void | Promise<void>;

interface Entry<T> {
  promisedStore: Promise<T>;
  signature: string;
}

const signature = new Date().toJSON();

export function createStore<T>(key: string, factoryFn: FactoryFn<T>, disposeFn?: DisposeFn<T>) {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const fn = (ctx: any, ...rest: any[]): Promise<T> => {
    const entry = getStoreEntry<T>(ctx, key);
    if (entry && entry.signature === signature) {
      return entry.promisedStore;
    }

    if (disposeFn && entry) {
      (async () => {
        await disposeFn(await entry.promisedStore);
      })();
    }

    const promisedStore = Promise.resolve(factoryFn(ctx, ...rest));
    saveStoreEntry(ctx, key, { promisedStore, signature });
    return promisedStore;
  };

  return fn;
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function getStoreEntry<T>(ctx: any, key: string): Entry<T> | undefined {
  const entries = ctx.env._storeEntries;
  if (!entries) {
    return;
  }
  return entries[key];
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function saveStoreEntry<T>(ctx: any, key: string, entry: Entry<T>): void {
  ctx.env._storeEntries = ctx.env._storeEntries ?? {};
  const entries = ctx.env._storeEntries;
  entries[key] = entry;
}
