/**
 * Native re-implementation of `unflatten` from the `flat` package.
 *
 * Converts an object with dot-notation keys into a nested object.
 * e.g. { 'a.b.c': 1 } => { a: { b: { c: 1 } } }
 *
 * Array indices in keys (e.g. 'a.0.b') are also handled, producing arrays
 * rather than objects for numeric segments.
 */
export default function unflatten(
  flat: Record<string, any>,
  delimiter = '.',
): Record<string, any> {
  const result: Record<string, any> = {};

  for (const key of Object.keys(flat)) {
    const parts = key.split(delimiter);
    let cursor: Record<string, any> = result;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      const nextPart = parts[i + 1];
      const nextIsIndex = /^\d+$/.test(nextPart);

      if (
        cursor[part] === undefined ||
        cursor[part] === null ||
        typeof cursor[part] !== 'object'
      ) {
        cursor[part] = nextIsIndex ? [] : {};
      }
      cursor = cursor[part];
    }

    cursor[parts[parts.length - 1]] = flat[key];
  }

  return result;
}
