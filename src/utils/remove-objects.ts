import removeObject from './remove-object.js';

export default function removeObjects<T>(items: T[], array: T[]): void {
  items.forEach((item) => {
    removeObject(array, item);
  });
}
