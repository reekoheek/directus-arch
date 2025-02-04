import type { Claims } from './Claims.js';

export interface Auth<TClaims extends Claims = Claims> {
  token(): string | null;
  claims(): TClaims | null;
  login(username: string, password: string): Promise<void>;
  authenticate(): Promise<void>;
  logout(): Promise<void>;
}
