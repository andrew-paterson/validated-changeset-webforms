import createChangeset from './create-changeset.js';
import generateFormFieldInstance from './generate-form-field-instance.js';
import FormSettings from '../ui/form-settings.js';
import ChangesetWebform from '../changeset-webform.js';
import FormField from '../ui/form-field.js';
import { FormData } from '../types.js';

export default function createChangesetWebformProps(
  instance: InstanceType<typeof ChangesetWebform>,
  data: FormData,
  modules: any,
) {
  const parsedFields: InstanceType<typeof FormField>[] =
    instance.formSchemaWithDefaults.fields.map((field) =>
      generateFormFieldInstance(
        field,
        instance.formSchemaWithDefaults.formSettings.formName,
        modules,
      ),
    );

  const changeset =
    instance.changeset ||
    createChangeset(
      parsedFields,
      data,
      instance.formSchemaWithDefaults.validators,
      modules.Changeset,
    );

  const snapshots = [];
  parsedFields.forEach((formField, index) => {
    formField.index = index;
    formField.siblings = parsedFields.filter(
      (field) => field.fieldId !== formField.fieldId,
    );
    formField.dynamicIncludeExcludeConditions =
      instance.dynamicIncludeExcludeConditions;
    formField.snapshots = snapshots;
    formField.changesetWebform = instance;
    formField._checkOmitted();
  });
  const FormSettingsModule = modules.FormSettings || FormSettings;
  return {
    changeset: changeset,
    parsedFields: parsedFields,
    snapshots: snapshots,
    formSettings: new FormSettingsModule(
      instance.formSchemaWithDefaults.formSettings,
    ),
  };
}
