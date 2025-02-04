import type { Query, QueryResult } from './Query.js';

export interface Dao {
  search<T extends object = Record<string, unknown>>(collection: string, query?: Query): Promise<QueryResult<T>>;
  create<T extends object = Record<string, unknown>>(collection: string, item: T): Promise<void>;
  read<T extends object = Record<string, unknown>>(collection: string, key: string): Promise<T>;
  update<T extends object = Record<string, unknown>>(collection: string, key: string, item: T): Promise<void>;
  delete(collection: string, key: string): Promise<void>;
}
