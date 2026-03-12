import isObject from './is-object.js';

function isPromiseLike(obj: Record<string, any>): boolean {
  return (
    !!obj &&
    !!obj.then &&
    !!obj.catch &&
    !!obj.finally &&
    typeof obj.then === 'function' &&
    typeof obj.catch === 'function' &&
    typeof obj.finally === 'function'
  );
}

export default function isPromise(obj: Record<string, any>): boolean {
  return isObject(obj) && isPromiseLike(obj);
}
