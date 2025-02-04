import type { BaseAction } from './BaseAction.js';

export interface BulkAction<T extends object> extends BaseAction {
  execute: (items: T[]) => Promise<void> | void;
}
