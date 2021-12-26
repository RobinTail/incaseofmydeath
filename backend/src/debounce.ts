import MemoryCache from "fast-memory-cache";

const cache = new MemoryCache();

type AnyFn = (...params: any) => any;

interface DebounceProps<T extends AnyFn> {
  name: string;
  seconds: number;
  fn: T;
  mapper: (...params: Parameters<T>) => string;
  thisRef?: any;
}

export function debounce<T extends AnyFn>({
  fn,
  name,
  seconds,
  mapper,
  thisRef,
}: DebounceProps<T>): T {
  const debounced = (...params: Parameters<T>) => {
    const key = `${name}\t${mapper(...params)}`;
    const cached = cache.get(key);
    if (cached === undefined) {
      const result = fn.apply(thisRef, params);
      cache.set(key, result, seconds);
      return result;
    }
    return cached;
  };
  return debounced as T;
}
