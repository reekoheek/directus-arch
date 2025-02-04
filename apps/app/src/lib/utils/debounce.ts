type Fn<T> = (...args: T[]) => unknown;

export function debounce<T>(fn: Fn<T>, delay: number) {
  let t = 0;

  const clear = () => clearTimeout(t);

  const result = (...args: T[]) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };

  result.clear = clear;

  return result;
}
