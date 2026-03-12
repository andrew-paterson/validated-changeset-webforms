import getWithDefaultUtil from './utils/get-with-default.js';
import createChangesetWebformProps from './utils/create-changeset-webform-props.js';
import onFormSubmitDefault from './utils/on-submit.js';
import type {
  ChangesetWebformProps,
  FormSchema,
  FormData,
  ValidationResult,
  OnSubmit,
} from './types.js';
import FormField from './ui/form-field.js';

function setChangesetWebformProps(
  instance: ChangesetWebform,
  data?: FormData,
): void {
  const props = createChangesetWebformProps(instance, data, instance.modules);
  if (!instance.changeset) {
    instance.changeset = props.changeset;
  }
  instance.fields = props.parsedFields;
  instance.formSettings = props.formSettings;
}

export default class ChangesetWebform {
  formSchemaWithDefaults: ChangesetWebformProps['formSchemaWithDefaults'];
  debug: boolean;
  dynamicIncludeExcludeConditions: ChangesetWebformProps['dynamicIncludeExcludeConditions'];
  callbacks: ChangesetWebformProps['callbacks'];
  fields: InstanceType<typeof FormField>[];
  submit: () => OnSubmit;
  changeset: ChangesetWebformProps['changeset'];
  modules: ChangesetWebformProps['modules'];
  formSettings: ChangesetWebformProps['formSettings'];
  constructor(
    public formSchema: FormSchema,
    data: FormData,
    opts: any,
  ) {
    const {
      appDefaults,
      dynamicIncludeExcludeConditions,
      debug,
      callbacks,
      modules,
    } = opts;

    const onFormSubmit = opts.onFormSubmit || onFormSubmitDefault;
    const formSchemaWithDefaults = getWithDefaultUtil(appDefaults, formSchema);
    this.formSchema = { ...formSchema };
    this.formSchemaWithDefaults = { ...formSchemaWithDefaults };
    this.debug = debug;
    this.dynamicIncludeExcludeConditions = dynamicIncludeExcludeConditions;
    this.callbacks = callbacks;
    this.modules = modules;
    setChangesetWebformProps(this, data);
    this.submit = () => {
      return onFormSubmit(this);
    };
  }

  get hasUnvalidatedFields() {
    return (
      this.fields.filter(
        (field) => field.validates && !field.wasValidated && !field.isOmitted,
      ).length > 0
    );
  }

  get hasValidationErrors() {
    return this.changeset.errors.length > 0;
  }

  _checkOmitted() {
    this.fields.forEach((field) => {
      field._checkOmitted();
    });
  }

  getField(fieldId: string) {
    const field = this.fields.find((field) => field.fieldId === fieldId);
    if (!field) {
      return null;
    }
    return field;
  }

  async getData() {
    const savedChangeset = await this.changeset.save();
    return savedChangeset.data;
  }

  setFieldOmission(fieldId, omitted) {
    const field = this.getField(fieldId);
    if (!field) {
      return;
    }
    field.setOmission(omitted);
  }

  pushErrors(opts) {
    const formField = this.getField(opts.fieldId);
    formField.pushErrors(opts.errors);
  }

  async validate(opts?: {
    skipUnvalidated?: boolean | null;
  }): Promise<ValidationResult[]> {
    const validatePromises = this.fields
      .filter((field) => {
        return field.validationRules && field.validationRules.length > 0;
      })
      .map((field) => {
        return field.validate(opts);
      })
      .filter((item) => item);
    return await Promise.all(validatePromises);
  }

  clear() {
    if (this.callbacks.beforeClearForm) {
      this.callbacks.beforeClearForm(this);
    }
    this.changeset.rollback();
    setChangesetWebformProps(this);
    this.fields.forEach((field) => {
      this.changeset.set(field.propertyName, null);
    });
    if (this.callbacks.afterClearForm) {
      this.callbacks.afterClearForm(this);
    }
  }

  reset() {
    if (this.callbacks.beforeResetForm) {
      this.callbacks.beforeResetForm(this);
    }
    this.changeset.rollback();
    setChangesetWebformProps(this);
    if (this.callbacks.afterResetForm) {
      this.callbacks.afterResetForm(this);
    }
  }
}
