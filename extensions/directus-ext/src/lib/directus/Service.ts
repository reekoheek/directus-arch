import type { Query } from '@directus/types';

export interface MutationOptions {
  emitEvents?: boolean;
}

export type PermissionsAction = 'create' | 'read' | 'update' | 'delete' | 'comment' | 'explain' | 'share';

export type QueryOptions = {
  stripNonRequested?: boolean;
  permissionsAction?: PermissionsAction;
  emitEvents?: boolean;
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export interface Service<T = any> {
  createOne(item: Partial<T>, opts?: MutationOptions): Promise<void>;
  createMany(items: Partial<T>, opts?: MutationOptions): Promise<void>;
  readOne(key: string, query?: Query): Promise<T>;
  readByQuery(query: Query, opts?: QueryOptions): Promise<T[]>;
  updateOne(id: string, item: Partial<T>, opts?: MutationOptions): Promise<void>;
  updateMany(ids: string[], data: Partial<T>): Promise<string[]>;
  updateByQuery(query: Query, data: Partial<T>, opts?: MutationOptions): Promise<string[]>;
  upsertOne(item: Partial<T>): Promise<void>;
  deleteOne(id: string, opts?: MutationOptions): Promise<string>;
  deleteMany(ids: string[]): Promise<string[]>;
}
