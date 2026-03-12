import _mergeWith from 'lodash.mergewith';

import mergeWithArrayInheritanceCustomiser from './merge-with-array-inheritance-customiser.js';
import ChangesetWebform from '../changeset-webform.js';
import type FormField from '../ui/form-field.js';
import { ClassNameSettings } from '../types.js';

export default function (
  elementType: string,
  changesetWebform: InstanceType<typeof ChangesetWebform>,
  formField: InstanceType<typeof FormField>,
) {
  const appClassNameSettings: ClassNameSettings =
    changesetWebform.formSchemaWithDefaults.classNameSettings;
  const formFieldClassNames: ClassNameSettings = {};
  if (formField && (formField.attrsFromConfig.classNames || {})[elementType]) {
    formFieldClassNames[elementType] =
      formField.attrsFromConfig.classNames[elementType] || [];
  }
  return _mergeWith(
    {},
    appClassNameSettings,
    formFieldClassNames,
    mergeWithArrayInheritanceCustomiser,
  );
}
