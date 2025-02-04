type Fn<T> = (...args: T[]) => unknown;

export function throttle<T>(fn: Fn<T>, delay: number) {
  let lastTime = 0;
  return (...args: T[]) => {
    const now = new Date().getTime();
    if (now - lastTime >= delay) {
      fn(...args);
      lastTime = now;
    }
  };
}
