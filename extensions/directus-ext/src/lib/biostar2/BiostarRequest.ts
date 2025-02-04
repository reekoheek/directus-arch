import type { ResultMapper, ErrorMapper } from './BiostarClient.js';

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export interface BiostarRequest<TResult = any> {
  method: Method;
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
  mapResult?: ResultMapper<TResult>;
  mapError?: ErrorMapper;
}
