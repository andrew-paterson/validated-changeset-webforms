import {
  lookupValidator,
  Changeset as defaultChangeset,
} from 'validated-changeset';

import createValidations from './create-validations.js';
import { ValidatorFactory } from '../types.js';

type validators = {
  [key: string]: ValidatorFactory;
};

export default function createChangeset(
  formFields,
  data,
  validators: validators = {},
  Changeset = defaultChangeset,
) {
  data = data || {};
  const validationsMap = createValidations(formFields, validators);
  const changeset = Changeset(
    data,
    lookupValidator(validationsMap),
    validationsMap,
    { skipValidate: true },
  );
  // We apply default values after creating the changeset instance, because the Changeset method does strange things to certain values, such as moment objects. changeset.set does not have the same issues.
  formFields.forEach((field) => {
    if (changeset.get(field.propertyName) !== undefined) {
      return;
    }
    // We set changeset props to null if they have no initial values. This ensures that validators such as uniqueness work, and that all keys are sent in the payload.
    const initialValue =
      field.defaultValue === undefined ? null : field.defaultValue;
    changeset.set(field.propertyName, initialValue);
  });
  return changeset;
}
