import isObject from './is-object.js';
import Option from '../ui/option-class.js';
import safeName from './safe-name.js';
import { FieldSchema } from '../types.js';

function isPrimitive(value: any): boolean {
  return (
    value === null || (typeof value !== 'object' && typeof value !== 'function')
  );
}

export default function parseChangesetWebformField(
  fieldSchema: FieldSchema,
  formName: string,
  CustomOptionModule?: typeof Option,
): FieldSchema {
  let field: FieldSchema = { ...fieldSchema };
  field.fieldSchema = fieldSchema;
  if (field.cloneFieldSchema) {
    field.cloneGroupName = field.fieldId;
    field.cloneGroupNumber = 0;
    field.cloneFieldSchema.fieldId = field.fieldId;
    field.clonedFieldBlueprint = parseChangesetWebformField(
      field.cloneFieldSchema,
      formName,
    );
  }

  if (field.options && Array.isArray(field.options)) {
    field.options = field.options.map(function (option) {
      if (field.fieldType === 'radioButtonGroup' && isPrimitive(option)) {
        option = { label: option, value: option };
      }
      if (field.fieldType === 'checkboxGroup' && isPrimitive(option)) {
        option = { label: option, key: option };
      }
      const optionModule = CustomOptionModule || Option;
      if (isObject(option)) {
        return new optionModule(option);
      }
      return option;
    });
  }

  if ((field.cloneFieldSchema || {}).validationRules) {
    field.clonedFieldBlueprint.validatesOn.forEach((event) => {
      const skip = ['submit', 'removeClone'];
      if (skip.indexOf(event) > -1) {
        return;
      }
      if (
        !field.validatesOn.find((fieldEvent) => fieldEvent === `${event}Clone`)
      ) {
        field.validatesOn.push(`${event}Clone`);
      }
    });
  }

  field.name =
    field.name || safeName(`${formName}-form-${field.fieldId}-field`);
  field.id = field.id || safeName(`${formName}-form-${field.fieldId}-field`);
  field.placeholder = field.placeholder || field.fieldLabel;
  field.propertyName = field.propertyName || field.fieldId;
  // field.customParsers array is created in mergeWithArrayInheritanceCustomiser function for lodash.mergeWith. It simply stascks each customParser function in order.
  if (field.customParsers) {
    field.customParsers.forEach((customParser) => {
      field = customParser(field);
    });
  }
  if (!field.ignoreValidation) {
    field.validatesOn = ['forceValidation'].concat(field.validatesOn || []);
  }
  const arr = ['keyDown', 'keyUp'];
  if (
    arr.some((event) => field.validatesOn.includes(event)) &&
    field.showValidationWhenFocussed !== false
  ) {
    field.showValidationWhenFocussed = true;
  }
  delete field.cloneFieldSchema;
  return field;
}
