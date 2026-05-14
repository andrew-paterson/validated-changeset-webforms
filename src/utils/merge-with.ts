/**
 * Native re-implementation of lodash.mergeWith.
 *
 * Recursively merges own enumerable properties of source objects into the
 * destination object. A customiser function may be provided; if it returns
 * `undefined` the merge falls back to the default deep-merge behaviour.
 *
 * @param object      - The destination object (mutated in place).
 * @param sources     - One or more source objects.
 * @param customiser  - Optional function called for each merged value:
 *                      (destValue, srcValue, key, dest, src) => mergedValue | undefined
 */
type Customiser = (
  destValue: any,
  srcValue: any,
  key: string,
  dest: Record<string, any>,
  src: Record<string, any>,
) => any;

function isPlainObject(value: unknown): value is Record<string, any> {
  if (typeof value !== 'object' || value === null) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function basemergeWith(
  dest: Record<string, any>,
  src: Record<string, any>,
  customiser: Customiser | undefined,
  seen: WeakMap<object, object>,
): Record<string, any> {
  for (const key of Object.keys(src)) {
    const srcVal = src[key];
    const destVal = dest[key];

    if (customiser) {
      const result = customiser(destVal, srcVal, key, dest, src);
      if (result !== undefined) {
        dest[key] = result;
        continue;
      }
    }

    if (Array.isArray(srcVal)) {
      dest[key] = Array.isArray(destVal) ? destVal.concat(srcVal) : [...srcVal];
    } else if (isPlainObject(srcVal)) {
      if (seen.has(srcVal)) {
        dest[key] = seen.get(srcVal);
        continue;
      }
      const nested: Record<string, any> = isPlainObject(destVal) ? destVal : {};
      seen.set(srcVal, nested);
      dest[key] = basemergeWith(nested, srcVal, customiser, seen);
    } else if (srcVal !== undefined) {
      dest[key] = srcVal;
    }
  }
  return dest;
}

export default function mergeWith(
  object: Record<string, any>,
  ...args: any[]
): Record<string, any> {
  const customiser: Customiser | undefined =
    typeof args[args.length - 1] === 'function' ? args.pop() : undefined;

  const seen = new WeakMap<object, object>();
  for (const src of args) {
    if (src != null && typeof src === 'object') {
      basemergeWith(object, src as Record<string, any>, customiser, seen);
    }
  }
  return object;
}
