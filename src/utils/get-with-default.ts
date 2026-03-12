import _mergeWith from 'lodash.mergewith';

import mergeWithArrayInheritanceCustomiser from './merge-with-array-inheritance-customiser.js';
import {
  FormSchema,
  ValidatorFactory,
  AttrsFromConfig,
  FormSettings,
  FieldSchema,
  ClassNameSettings,
} from '../types.js';

export default function getWithDefault(
  defaults: Record<string, any>[] = [],
  formSchema: FormSchema,
): {
  validators: {
    [key: string]: ValidatorFactory;
  };
  classNameSettings: ClassNameSettings;
  attrFunctions: AttrsFromConfig['attrFunctions'];
  formSettings: FormSettings;
  fields: FieldSchema[];
} {
  const fieldSettingsDefaults = defaults.map((item) => item.fieldSettings);
  const formSettingsDefaults = defaults.map((item) => item.formSettings);
  const validatorsDefaults = defaults.map((item) => item.validators);
  const classNamesDefaults = defaults.map(
    (item) => item.attrsFromConfig.classNames,
  );
  const attrFunctionsDefaults = defaults.map(
    (item) => item.attrsFromConfig.attrFunctions,
  );

  const formSettings = _mergeWith(
    {},
    ...formSettingsDefaults,
    formSchema ? formSchema.formSettings : {},
  );
  const classNameSettings = _mergeWith(
    {},
    ...classNamesDefaults,
    formSchema ? formSchema.attrsFromConfig?.classNames : {},
    mergeWithArrayInheritanceCustomiser,
  );

  const validators = _mergeWith(
    {},
    ...validatorsDefaults,
    formSchema.validators,
  );

  const attrFunctions = _mergeWith(
    {},
    ...attrFunctionsDefaults,
    formSchema.attrFunctions,
  );

  const mergedFields = (formSchema.fields || []).map((field) => {
    const fieldTypeDefaults = defaults.map((item) => {
      return item.fieldTypes.find(
        (itemFieldType) => itemFieldType.fieldType === field.fieldType,
      );
    });
    const formLevelFieldTypeSettings =
      formSchema.fieldSettings?.fieldTypes?.find(
        (fieldType) => fieldType.fieldType === field.fieldType,
      );

    const mergedField = _mergeWith(
      {},
      ...fieldSettingsDefaults,
      ...fieldTypeDefaults,
      formSchema.fieldSettings,
      formLevelFieldTypeSettings || {},
      field,
      mergeWithArrayInheritanceCustomiser,
    );
    mergedField.validatesOn = mergedField.validatesOn || [];
    if (mergedField.ignoreValidation) {
      mergedField.validatesOn = [];
    }
    if (
      !mergedField.validatesOn.includes('submit') &&
      !mergedField.ignoreValidation
    ) {
      console.warn(
        `[Ember Changeset Webforms] Field ${field.fieldId} does not validate on submit. This is not recommended. You can either add $inherited or submit to the validatesOn array. The current value is [${mergedField.validatesOn}]`,
      );
    }
    if (field.cloneFieldSchema) {
      const cloneFieldDefaults = defaults.reduce((acc, item) => {
        acc.push(item.fieldSettings);
        acc.push(
          item.fieldTypes.find(
            (itemFieldType) =>
              itemFieldType.fieldType === field.cloneFieldSchema.fieldType,
          ),
        );
        return acc;
      }, []);
      const mergedCloneField = _mergeWith(
        {},
        ...Object.values(cloneFieldDefaults),
        field.cloneFieldSchema,
        mergeWithArrayInheritanceCustomiser,
      );
      mergedField.cloneFieldSchema = mergedCloneField;
    }
    return mergedField;
  });
  return {
    validators: validators,
    classNameSettings: classNameSettings,
    attrFunctions: attrFunctions,
    formSettings: formSettings,
    fields: mergedFields,
  };
}
