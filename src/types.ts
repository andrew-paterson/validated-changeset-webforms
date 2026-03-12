import { Changeset } from 'validated-changeset';

import ChangesetWebform from './changeset-webform.js';
import type FormField from './ui/form-field.js';
import type FormFieldClone from './ui/form-field-clone.js';

export type ChangesetWebformProps = {
  formSchemaWithDefaults: any;
  debug: boolean;
  dynamicIncludeExcludeConditions: {
    [key: string]: (value: any, condition: any) => boolean;
  };
  callbacks: CwfCallbacks;
  changeset: ReturnType<typeof Changeset>;
  modules: any[];
  formSettings: any;
};

export type AttrsFromConfig = {
  classNames?: {
    [key: string]: string[] | null;
  };
  attrFunctions?: {
    [key: string]: (
      element: HTMLElement,
      changesetWebform: any[],
      field: FormField | FormFieldClone,
    ) => void;
  };
};

export type FormSettings = {
  formName: string | null;
  novalidate: boolean;
  hideSubmitButton: boolean;
  submitButtonText: string | null;
  requestInFlightIcon: null;
  addCloneButtonIconComponent: null;
  clearFormButton: boolean;
  clearFormButtonText: string | null;
  resetFormButton: boolean;
  resetFormButtonText: string | null;
  submitAfterClear: boolean;
  clearFormAfterSubmit: boolean;
  submitButtonType: string | null;
  attrsFromConfig: AttrsFromConfig | null;
};

export type FormSchema = {
  formSettings: FormSettings;
  fields: FieldSchema[];
  attrsFromConfig?: AttrsFromConfig | null;
  attrFunctions?: AttrsFromConfig['attrFunctions'] | null;
  fieldSettings?: any;
  validators?: {
    [key: string]: ValidatorFactory | FieldValidator;
  } | null;
};

export type ValidationRule = {
  validationMethod: string;
  arguments: any;
  activateValidation?: number[] | null;
};

export type FieldSchema = {
  // Core identifiers (required)
  fieldId: string; // String (required)
  fieldLabel: string | ((clone: FormField | FormFieldClone) => string); // String (required)
  fieldType: string | null;

  // Identity / HTML attrs
  propertyName: string | null; // Optional - defaults to `fieldId`
  name: string | null; // Optional - defaults to the fieldId
  id: string | null; // Optional - element id

  // Type and presentation
  inputType?: string | null; // e.g. 'text', 'password'
  placeholder?: string | ((clone: FormField | FormFieldClone) => string) | null;
  fieldDescription?: string | null;

  // Validation & behaviour
  validationRules?: ValidationRule[] | null;
  validatesOn?: string[] | null;
  showValidationWhenFocussed?: boolean | null;
  ignoreValidation?: boolean | null;

  // Omission / visibility
  omitted?: boolean | object | null;
  isOmitted?: boolean | null; // derived at runtime
  resetWhenOmitted?: boolean | null;

  // Defaults / values
  defaultValue?: any | null;
  valueFilter?: (value: any, env: FormField | FormFieldClone) => any;

  // Labels / accessibility
  labelComponent?: any | null;
  labelMarkdown?: string | null;
  hideLabel?: boolean | null;
  includeLabelForAttr?: boolean | null;
  requiresAriaLabelledBy?: boolean | null;

  // State & flags
  disabled?: boolean | null;
  autofocus?: boolean | null;
  customParsers?: ((field: FieldSchema) => any)[] | null;

  // Clone/group related
  cloneFieldSchema?: FieldSchema | null;
  cloneGroupName?: string | null;
  cloneGroupNumber?: number | null;
  clonedFieldBlueprint?: FieldSchema | null;

  minClones?: number | null;
  maxClones?: number | null;

  cloneButtonText?: string | null;

  // Options / select-like fields
  options?: any[] | null;
  optionDisplayProp?: string | null;
  optionComponent?: any | null;
  selectedItemComponent?: any | null;

  // Presentation / config
  attrsFromConfig?: AttrsFromConfig | null;
  cloneActionsPosition?:
    | 'labelWrapper'
    | 'preClones'
    | 'fieldWrapperEl'
    | 'fieldActions'
    | 'fieldContents'
    | null;

  fieldSchema?: FieldSchema | null;
};

export type ValidityElement = Element & {
  setCustomValidity(message: string): void;
};

export type FieldValidator<TContent = Record<string, any>, TValue = any> = (
  key: keyof TContent & string,
  newValue: TValue,
  oldValue: TValue,
  changes: Partial<Record<keyof TContent, TValue>>,
  content: TContent,
) => true | string | { clones: (true | string)[] };

// Factory that returns a FieldValidator
export type ValidatorFactory<TContent = Record<string, any>, TValue = any> = (
  opts?: any,
) => FieldValidator<TContent, TValue>;

export type ClassNameSettings = {
  [key: string]: string[] | null;
};

export type FormData = {
  [key: string]: any;
};

export type Option = {
  value: any;
  label?: string | number;
  key?: string | number;
};

export type ValidationResult =
  | string
  | {
      value: any;
      validation: string[];
    };

export type CwfCallbacks = {
  afterValidateFields?: (
    changesetWebform: InstanceType<typeof ChangesetWebform>,
    validationResult: any,
  ) => Promise<void> | void;
  formValidationPassed?: (
    changesetWebform: InstanceType<typeof ChangesetWebform>,
  ) => Promise<void> | void;
  formValidationFailed?: (
    changesetWebform: InstanceType<typeof ChangesetWebform>,
  ) => Promise<void> | void;
  afterFieldValidation?: (
    formField: InstanceType<typeof FormField>,
    changesetWebform: InstanceType<typeof ChangesetWebform>,
    validationResult: any,
  ) => Promise<void> | void;
  onFieldValueChange?: (
    formField: InstanceType<typeof FormField>,
    changesetWebform: InstanceType<typeof ChangesetWebform>,
  ) => void;
  beforeClearForm?: (
    changesetWebform: InstanceType<typeof ChangesetWebform>,
  ) => void;
  afterClearForm?: (
    changesetWebform: InstanceType<typeof ChangesetWebform>,
  ) => void;
  beforeResetForm?: (
    changesetWebform: InstanceType<typeof ChangesetWebform>,
  ) => void;
  afterResetForm?: (
    changesetWebform: InstanceType<typeof ChangesetWebform>,
  ) => void;
  beforeSubmitForm?: (
    changesetWebform: InstanceType<typeof ChangesetWebform>,
  ) => Promise<void> | void;
  submitData?: (
    data: any,
    changesetWebform: InstanceType<typeof ChangesetWebform>,
  ) => Promise<any> | any;
  submitSuccess?: (
    response: any,
    changesetWebform: InstanceType<typeof ChangesetWebform>,
  ) => void;
  submitError?: (
    error: any,
    changesetWebform: InstanceType<typeof ChangesetWebform>,
  ) => void;
  submitComplete?: (
    status: 'success' | 'error',
    responseOrError: any,
    changesetWebform: InstanceType<typeof ChangesetWebform>,
  ) => void;
};

export type OnSubmit = (
  changesetWebform: InstanceType<typeof ChangesetWebform>,
) => any;
