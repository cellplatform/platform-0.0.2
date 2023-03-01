export * from './Value.Object.keyPath.mjs';

/**
 * Walks an object tree (recursive descent) implementing
 * a visitor callback for each item.
 */
export function walk<T>(
  obj: T,
  fn: (e: { key: string | number; value: any; stop(): void }) => void,
) {
  let _stopped = false;

  const process = (key: string | number, value: any) => {
    if (_stopped) return;
    fn({
      key,
      value,
      stop: () => (_stopped = true),
    });
    const isObject = typeof obj === 'object' && obj !== null;
    if (!_stopped && (isObject || Array.isArray(value))) {
      walk(value, fn); // <== RECURSION 🌳
    }
  };

  if (Array.isArray(obj)) {
    obj.forEach((item, i) => process(i, item));
  } else if (typeof obj === 'object' && obj !== null) {
    Object.entries(obj).forEach(([key, value]) => process(key, value));
  }
}

/**
 * Converts an object into an array of {key,value} pairs.
 */
export function toArray<T = Record<string, unknown>, K = keyof T>(
  obj: Record<string, any>,
): { key: K; value: T[keyof T] }[] {
  return Object.keys(obj).map((key) => ({ key: key as unknown as K, value: obj[key] }));
}

/**
 * Walk the tree and ensure all strings are less than the given max-length.
 */
export function trimStringsDeep<T extends Record<string, any>>(
  obj: T,
  options: { maxLength?: number; ellipsis?: boolean; immutable?: boolean } = {},
) {
  // NB: This is a recursive function ← via Object.walk(🌳)
  const { ellipsis = true, immutable = true } = options;
  const MAX = options.maxLength ?? 35;

  const adjust = (obj: Record<string, string>) => {
    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === 'string' && value.length > MAX) {
        let text = value.slice(0, MAX);
        if (ellipsis) text += '...';
        (obj as any)[key] = text;
      }
    });
  };

  const clone = immutable ? structuredClone(obj) : obj;
  adjust(clone);
  walk(clone, (e) => {
    const value = e.value;
    if (typeof value === 'object' && value !== null) adjust(value);
  });

  return clone;
}
