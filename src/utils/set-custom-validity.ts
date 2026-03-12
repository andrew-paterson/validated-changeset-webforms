import classNamesConfigInstance from './class-names-config-instance.js';
import FormField from '../ui/form-field.js';
import ChangesetWebform from '../changeset-webform.js';

export default function setCustomValidity(
  elementTypesString: string,
  changesetWebform: InstanceType<typeof ChangesetWebform>,
  formField: InstanceType<typeof FormField>,
): boolean {
  if (!changesetWebform) {
    return;
  }
  const classNamesArray: string[] = classNamesConfigInstance(
    elementTypesString,
    changesetWebform,
    formField,
  );
  return classNamesArray.includes('$validationPseudoClasses');
}
