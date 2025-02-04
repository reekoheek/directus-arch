import type { ButtonVariant } from '@lib/components/Button.js';

export interface BaseAction {
  label?: string;
  icon?: string;
  variant?: ButtonVariant;
}
