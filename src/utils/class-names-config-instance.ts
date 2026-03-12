import mergedClassNameSettings from './merged-class-name-settings.js';
import ChangesetWebform from '../changeset-webform.js';
import type FormField from '../ui/form-field.js';
import { ClassNameSettings } from '../types.js';

export default (
  elementTypesString: string,
  changesetWebform: InstanceType<typeof ChangesetWebform>,
  formField: InstanceType<typeof FormField>,
): string[] => {
  if (!changesetWebform) {
    return;
  }
  const elementTypes: string[] = elementTypesString.split(',');
  return elementTypes
    .reduce((accumulatedClassNames: string[], elementType: string) => {
      const classNameSettings: ClassNameSettings = mergedClassNameSettings(
        elementType,
        changesetWebform,
        formField,
      );

      accumulatedClassNames = accumulatedClassNames.concat(
        classNameSettings[elementType] || [],
      );

      return accumulatedClassNames;
    }, [])
    .map((item: string) => item.trim());
};
