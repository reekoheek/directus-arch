type Fn = (...args: unknown[]) => unknown;

export function curry(fn: Fn) {
  const curried = (...args: unknown[]) => {
    if (args.length >= fn.length) {
      return fn(...args);
    }

    return (...nextArgs: unknown[]) => {
      return curried(...args.concat(nextArgs));
    };
  };
  return curried;
}
