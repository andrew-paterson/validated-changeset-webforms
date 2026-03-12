export default function isObject(val: any): boolean {
  return val !== null && val !== undefined && typeof val === 'object';
}
