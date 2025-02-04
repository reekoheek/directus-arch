import type { BaseAction } from './BaseAction.js';

export interface LinkListAction extends BaseAction {
  link: () => string;
}

export interface ClickListAction extends BaseAction {
  execute: () => Promise<void> | void;
}

export type ListAction = LinkListAction | ClickListAction;
