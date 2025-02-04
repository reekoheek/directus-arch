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

export interface Service<T> {
  createOne(item: Partial<T>, opts?: MutationOptions): Promise<void>;
  readOne(key: string, query?: Query): Promise<T>;
  readByQuery(query: Query, opts?: QueryOptions): Promise<T[]>;
  updateOne(id: string, item: Partial<T>, opts?: MutationOptions): Promise<void>;
  updateMany(ids: string[], data: Partial<T>): Promise<string[]>;
  upsertOne(item: Partial<T>): Promise<void>;
  deleteOne(id: string, opts?: MutationOptions): Promise<string>;
  deleteMany(ids: string[]): Promise<string[]>;
}
