export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(deepClone) as T;
  }

  const clonedObj: Record<string, unknown> = {};
  for (const key in obj) {
    clonedObj[key] = deepClone(obj[key]);
  }

  return clonedObj as T;
}
