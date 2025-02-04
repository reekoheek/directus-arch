export interface Filter {
  [key: string]: unknown;
}

export interface Query {
  fields?: string[];
  filter?: Filter;
  search?: string;
  offset?: number;
  limit?: number;
  sort?: string[];
}

export interface QueryResult<T extends object = Record<string, unknown>> {
  items: T[];
  count?: number;
}
