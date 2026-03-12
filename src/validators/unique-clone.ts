import { ValidatorFactory } from '../types.js';

const validateUniqueClone: ValidatorFactory = function validateUniqueClone(
  opts = {},
) {
  return (key, newValue, oldValue, changes, content) => {
    let response: string | boolean = true;
    const fieldName =
      opts && (opts as any).description ? (opts as any).description : key;

    // Avoid mutating caller objects — merge into a fresh object.
    const current = Object.assign({}, content, changes);

    // Be defensive: ensure we only try to search arrays.
    const findInstances = (arr: any, value: any) =>
      Array.isArray(arr) ? arr.filter((item) => item === value) : [];

    if (findInstances(current[key], newValue).length > 1) {
      response = `Each ${fieldName} must be unique.`;
    }

    return response;
  };
};

export default validateUniqueClone;
