export class BiostarError extends Error {
  constructor(
    message: string,
    readonly status = 0,
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    readonly data?: any,
  ) {
    super(message);
  }
}

export class HttpError extends Error {
  readonly status: number;

  constructor(readonly response: Response) {
    super(`HTTP ${response.status}`);
    this.status = response.status;
  }
}
