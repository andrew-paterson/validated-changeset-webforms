import classNamesConfigInstance from './class-names-config-instance.js';
import ChangesetWebform from '../changeset-webform.js';
import type FormField from '../ui/form-field.js';
import { ClassNameSettings } from '../types.js';

export default function (
  elementTypesString: string,
  changesetWebform: InstanceType<typeof ChangesetWebform>,
  formField: InstanceType<typeof FormField>,
): string[] {
  if (!changesetWebform) {
    return;
  }
  let classNamesArray = classNamesConfigInstance(
    elementTypesString,
    changesetWebform,
    formField,
  );
  const elementTypes = elementTypesString.split(',');
  elementTypes.forEach((elementType) => {
    classNamesArray = applyValidationClassNames(
      changesetWebform,
      formField,
      classNamesArray,
    );
    if (changesetWebform.debug) {
      const debugClass = `[$DEBUG=>configNameSpace===${elementType.replace(/,/g, '--')}]`;
      if (!classNamesArray.includes(debugClass)) {
        classNamesArray.unshift(debugClass);
      }
    }
  });
  return classNamesArray.filter((className) => !className.startsWith('$'));
}

function applyValidationClassNames(
  changesetWebform: InstanceType<typeof ChangesetWebform>,
  formField: InstanceType<typeof FormField>,
  classNamesArray: string[],
): string[] {
  const classNameSettings: ClassNameSettings =
    changesetWebform.formSchemaWithDefaults.classNameSettings;
  if (classNamesArray.includes('$validationClassNames')) {
    classNamesArray = classNamesArray.concat(
      (classNameSettings.validClassNames || []).map((item) => `!${item}`),
    );
    classNamesArray = classNamesArray.concat(
      (classNameSettings.invalidClassNames || []).map((item) => `!${item}`),
    );

    if (formField) {
      if (formField.showValidation) {
        if (formField.validationStatus === 'valid') {
          classNamesArray = classNamesArray.concat(
            classNameSettings.validClassNames || [],
          );
        } else if (formField.validationStatus === 'invalid') {
          classNamesArray = classNamesArray.concat(
            classNameSettings.invalidClassNames || [],
          );
        }
      }
    } else {
      if (changesetWebform.changeset.isValid) {
        classNamesArray = classNamesArray.concat(
          classNameSettings.validClassNames || [],
        );
      } else if (changesetWebform.changeset.isInvalid) {
        classNamesArray = classNamesArray.concat(
          classNameSettings.invalidClassNames || [],
        );
      }
    }
  }
  return classNamesArray;
}
