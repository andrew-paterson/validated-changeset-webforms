import parseChangesetWebformField from './parse-changeset-webform-field.js';
import FormField from '../ui/form-field.js';
import FormFieldClone from '../ui/form-field-clone.js';
import Option from '../ui/option-class.js';
import { FieldSchema } from '../types.js';

export default function generateFormFieldInstance(
  fieldSchema: FieldSchema,
  formName: string,
  modules: {
    FormField?: typeof FormField;
    FormFieldClone?: typeof FormFieldClone;
    Option?: typeof Option;
  } = {},
) {
  if (!fieldSchema) {
    return;
  }
  if (!fieldSchema.fieldId) {
    throw Error(
      '[Ember validating field] fieldId is a required field for each field in a validating form.',
    );
  }
  if (
    !fieldSchema.fieldLabel &&
    !fieldSchema.labelComponent &&
    !fieldSchema.labelMarkdown &&
    !['noDisplay', 'singleCheckbox', 'staticContent'].includes(
      fieldSchema.fieldType,
    )
  ) {
    console.warn(
      `[Ember validating field - ${fieldSchema.fieldId}] fieldLabel should be included for this field, to ensure sematic markup and accessibility. You can set hideLabel to true if you want to hide the label.`,
    );
  }
  const parsedField = parseChangesetWebformField(
    fieldSchema,
    formName,
    modules.Option,
  );
  const FormFieldModule = modules.FormField || FormField;
  return new FormFieldModule(parsedField, modules.FormFieldClone);
}
