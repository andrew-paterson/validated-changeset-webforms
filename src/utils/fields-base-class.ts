import type ChangesetWebform from '../changeset-webform.js';
import type { FieldSchema, ValidityElement } from '../types.js';
import FormField from '../ui/form-field.js';

export default class FieldsBaseClass {
  fieldId: FieldSchema['fieldId'];
  fieldLabel: FieldSchema['fieldLabel'];
  fieldType: FieldSchema['fieldType'];

  // Identity / HTML attrs
  propertyName: FieldSchema['propertyName'];
  name: FieldSchema['name'];
  id: FieldSchema['id'];

  // Type and presentation
  inputType?: FieldSchema['inputType'];
  placeholder?: FieldSchema['placeholder'];
  fieldDescription?: FieldSchema['fieldDescription'];

  // Validation & behaviour
  validationRules?: FieldSchema['validationRules'];
  validatesOn?: FieldSchema['validatesOn'];
  showValidationWhenFocussed?: FieldSchema['showValidationWhenFocussed'];
  ignoreValidation?: FieldSchema['ignoreValidation'];

  // Defaults / values
  defaultValue?: FieldSchema['defaultValue'];
  valueFilter?: FieldSchema['valueFilter'];

  // Labels / accessibility
  labelComponent?: FieldSchema['labelComponent'];
  labelMarkdown?: FieldSchema['labelMarkdown'];
  hideLabel?: FieldSchema['hideLabel'];
  includeLabelForAttr?: FieldSchema['includeLabelForAttr'];
  requiresAriaLabelledBy?: FieldSchema['requiresAriaLabelledBy'];

  // State & flags
  disabled?: FieldSchema['disabled'];
  autofocus?: FieldSchema['autofocus'];

  // Options / select-like fields
  options?: FieldSchema['options'];
  optionDisplayProp?: FieldSchema['optionDisplayProp'];
  optionComponent?: FieldSchema['optionComponent'];
  selectedItemComponent?: FieldSchema['selectedItemComponent'];

  // Runtime wiring (assigned by parser/create functions)
  fieldSchema?: FieldSchema | null;
  changesetWebform?: ChangesetWebform | null;
  siblings?: FormField[] | null;
  index?: number | null;
  eventLog?: string[] | null;
  previousValue?: any | null;
  customParsers?: ((field: FieldSchema) => any)[] | null;
  customValidityEls?: ValidityElement[] | null;
  hideValidation?: boolean | null;
  focussed?: boolean | null;
  isClone?: boolean | null;
}
