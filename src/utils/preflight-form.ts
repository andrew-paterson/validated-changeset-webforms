import nullifyOmittedFields from './nullify-omitted-fields.js';
import ChangesetWebform from '../changeset-webform.js';
import { CwfCallbacks, ValidationResult } from '../types.js';

export default async function preFlightForm(
  changesetWebform: InstanceType<typeof ChangesetWebform>,
) {
  const callbacks: CwfCallbacks = changesetWebform.callbacks;
  try {
    const changeset = changesetWebform.changeset;
    changesetWebform.fields.forEach((field) => {
      if (field.valueFilter) {
        field.valueFilter(field.fieldValue, field);
      }
      field.eventLog.push('submit');
      if (field.clonedFields) {
        field.clonedFields.forEach((clonedField, index) => {
          if (
            clonedField.validationRules &&
            clonedField.validationRules.length
          ) {
            clonedField.validationRules[0].activateValidation =
              clonedField.validationRules[0].activateValidation || [];
            clonedField.validationRules[0].activateValidation.push(index);
          }
          clonedField.eventLog.push('submit');
        });
        // TODO test for cloned fields without any validation rules
      }
    });

    const validationResult: ValidationResult[] =
      await changesetWebform.validate();
    if (callbacks.afterValidateFields) {
      await callbacks.afterValidateFields(changesetWebform, validationResult);
    }
    if (changeset.isValid) {
      if (callbacks.formValidationPassed) {
        await callbacks.formValidationPassed(changesetWebform);
      }
      nullifyOmittedFields(changesetWebform); // TODO test this
    } else {
      if (callbacks.formValidationFailed) {
        await callbacks.formValidationFailed(changesetWebform);
      }
    }
  } catch (err) {
    throw new Error(err);
  }
}
