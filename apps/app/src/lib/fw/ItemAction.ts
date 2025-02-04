import type { BaseAction } from './BaseAction.js';

export interface LinkItemAction<T extends object> extends BaseAction {
  link: (item: T, index: number) => string;
}

export interface ClickItemAction<T extends object> extends BaseAction {
  execute: (item: T, index: number) => Promise<void> | void;
}

export type ItemAction<T extends object> = LinkItemAction<T> | ClickItemAction<T>;
