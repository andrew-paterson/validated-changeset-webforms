import _mergeWith from 'lodash.mergewith';

import ChangesetWebform from '../changeset-webform';
import FormField from '../ui/form-field';
import { AttrsFromConfig } from '../types';

export default function (
  elementType: string,
  changesetWebform: InstanceType<typeof ChangesetWebform>,
  formField: InstanceType<typeof FormField>,
): {
  [key: string]: AttrsFromConfig['attrFunctions'];
} {
  const appAttrFunctions =
    changesetWebform.formSchemaWithDefaults.attrFunctions;
  const formFieldAttrFunctions = {};
  if (
    formField &&
    (formField.attrsFromConfig?.attrFunctions || {})[elementType]
  ) {
    formFieldAttrFunctions[elementType] =
      formField.attrsFromConfig?.attrFunctions[elementType] || [];
  }
  return _mergeWith({}, appAttrFunctions, formFieldAttrFunctions);
}
