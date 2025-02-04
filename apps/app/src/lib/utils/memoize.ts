type Fn = (...args: unknown[]) => unknown;

export function memoize(fn: Fn) {
  const cache: Record<string, unknown> = {};
  return (...args: unknown[]) => {
    const key = JSON.stringify(args);
    if (cache[key]) {
      return cache[key];
    }

    const result = fn(...args);
    cache[key] = result;
    return result;
  };
}
