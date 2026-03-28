import FieldsBaseClass from '../utils/fields-base-class.js';
import type {
  FieldSchema,
  ChangesetWebformProps,
  ValidationRule,
} from '../types.js';
import removeAll from '../utils/remove-all.js';
import FormFieldClone from './form-field-clone.js';
import removeObject from '../utils/remove-object.js';
import safeName from '../utils/safe-name.js';

export default class FormField extends FieldsBaseClass {
  // Omission / visibility
  omitted?: FieldSchema['omitted'];
  isOmitted?: FieldSchema['isOmitted'];
  resetWhenOmitted?: FieldSchema['resetWhenOmitted'];
  // Clone/group related
  cloneFieldSchema?: FieldSchema['cloneFieldSchema'];
  cloneGroupName?: FieldSchema['cloneGroupName'];
  cloneGroupNumber?: FieldSchema['cloneGroupNumber'];
  clonedFieldBlueprint?: FieldSchema['clonedFieldBlueprint'];
  minClones?: FieldSchema['minClones'];
  maxClones?: FieldSchema['maxClones'];
  cloneButtonText?: FieldSchema['cloneButtonText'];
  // Presentation / config
  attrsFromConfig?: FieldSchema['attrsFromConfig'];
  cloneActionsPosition?: FieldSchema['cloneActionsPosition'];
  // Runtime wiring (assigned by parser/create functions)
  snapshots?: any[] | null;
  FormFieldCloneClass: typeof FormFieldClone;
  lastUpdatedClone?: {
    index: number;
    previousValue: any;
    previousLength?: number;
  } | null;
  cloneId?: number | null;
  clonedFields?: FormFieldClone[] | null = [];
  cloneCountStatus?: 'min' | 'max' | null;
  dynamicIncludeExcludeConditions?: ChangesetWebformProps['dynamicIncludeExcludeConditions'];
  eventLog: string[] = [];
  constructor(
    args,
    FormFieldCloneClass: typeof FormFieldClone = FormFieldClone,
  ) {
    super();
    for (const key in args) {
      this[key] = args[key];
    }
    this.FormFieldCloneClass = FormFieldCloneClass;
  }
  get fieldValue() {
    // TODO check this works when fieldId and property name are different
    if (!this.changesetWebform.changeset) {
      return;
    }
    return this.changesetWebform.changeset.get(this.propertyName);
  }
  get validationErrors() {
    // TODO check this works when fieldId and property name are different
    return (
      this.changesetWebform.changeset.get(
        `error.${this.propertyName}.validation`,
      ) || []
    );
  }
  get masterFormFieldValidationErrors() {
    const masterFormFieldValidationErrors = this.validationErrors.filter(
      (item) => {
        return typeof item !== 'object' || !item.clones;
      },
    );
    return masterFormFieldValidationErrors;
  }
  get eventLogValidated() {
    return this.validatesOn.filter((eventName) =>
      this.eventLog.includes(eventName),
    );
  }
  get validates() {
    return this.validationRules.length > 0;
  }
  get wasValidated() {
    if (!this.validates) {
      return null;
    }
    if (this.hideValidation) {
      return null;
    }
    if (!this.eventLogValidated.length) {
      return null;
    }
    return true;
  }
  get showValidation() {
    if (!this.wasValidated) {
      return false;
    }
    if (!this.showValidationWhenFocussed && this.focussed) {
      return false;
    }
    return true;
  }
  get required() {
    return this.validationRules.find(function (rule: ValidationRule) {
      return (
        rule.validationMethod === 'validatePresence' &&
        (rule.arguments === true || rule.arguments.presence === true)
      );
    })
      ? true
      : false;
  }
  get validationStatus() {
    if (!this.wasValidated) {
      return null;
    }
    if (this.validationErrors.length === 0) {
      return 'valid';
    } else {
      return 'invalid';
    }
  }
  get isGroup() {
    return this.options ? true : null;
  }
  get typeClass() {
    return `cwf-field-type-${safeName(this.fieldType)}`;
  }
  get labelId() {
    return `${this.id}-label`;
  }
  get ariaLabelledBy() {
    if (!this.hideLabel && this.requiresAriaLabelledBy) {
      return this.labelId;
    }
    return null;
  }
  get ariaLabel() {
    if (this.hideLabel) {
      return this.fieldLabel;
    }
    return null;
  }
  get ariaInvalid() {
    return (this.validationErrors || []).length ? true : false;
  }
  get ariaErrorMessage() {
    return (this.validationErrors || []).length ? `${this.id}-errors` : null;
  }
  get ariaDescribedBy() {
    return this.fieldDescription ? `${this.id}-description` : null;
  }
  get isValid() {
    return this.validationStatus === 'valid';
  }
  _checkConditions(ruleSet: any, formField: FormField) {
    const results = ruleSet.conditions.map((condition) => {
      if (condition.conditions) {
        return this._checkConditions(condition, formField);
      }
      return this._checkCondition(formField, condition);
    });
    if (ruleSet.where === 'allConditionsTrue') {
      return results.includes(false) ? !ruleSet.returns : ruleSet.returns;
    } else if (ruleSet.where === 'anyConditionsTrue') {
      return results.includes(true) ? ruleSet.returns : !ruleSet.returns;
    }
  }
  _checkCondition(formField, condition) {
    const relatedSiblingField = formField.siblings.find((siblingField) => {
      return siblingField.fieldId === condition.fieldId;
    });
    const value = relatedSiblingField?.fieldValue;
    if (!value) {
      return false;
    }
    const dynamicIncludeExcludeConditions =
      formField.dynamicIncludeExcludeConditions || {};
    const conditionChecks = Object.assign(
      {},
      {
        valueEquals: (value, condition) => value === condition.valueEquals,
      },
      dynamicIncludeExcludeConditions,
    );
    for (const key in conditionChecks) {
      if (condition[key] && !conditionChecks[key](value, condition)) {
        return false;
      }
    }
    return true;
  }
  updateValue(value: any) {
    const changeset = this.changesetWebform.changeset;
    this.snapshots.push(this.changesetWebform.changeset.snapshot());
    this.eventLog.push('valueUpdated');
    this.previousValue = this.fieldValue;
    if (this.valueFilter && value) {
      value = this.valueFilter(value, this);
    }
    changeset.set(this.propertyName, value);
    this.validate({ skipUnvalidated: true });
    this.changesetWebform._checkOmitted();
    if (this.changesetWebform.callbacks.onFieldValueChange) {
      this.changesetWebform.callbacks.onFieldValueChange(
        this,
        this.changesetWebform,
      );
    }
  }
  setOmission(omitted?: boolean | object | null) {
    this.omitted = omitted;
    this._checkOmitted();
  }
  _checkOmitted() {
    const initiallyOmitted = this.isOmitted;
    if (!this.omitted) {
      this.isOmitted = false;
      return;
    }
    if (this.omitted === true || this._checkConditions(this.omitted, this)) {
      this.isOmitted = true;
      if (
        this.eventLog.includes('insert') &&
        !initiallyOmitted &&
        this.resetWhenOmitted
      ) {
        this.reset();
      }
    } else {
      this.isOmitted = false;
    }
  }
  reset() {
    this.changesetWebform.changeset.rollbackProperty(this.propertyName);
    // We use removeAll to avoid eventLog being forcibly reset as a prop, which breaks tracking
    removeAll(this.eventLog);
  }
  async validate(opts: any = {}) {
    if (!('skipUnvalidated' in opts) || opts.skipUnvalidated !== true) {
      this.eventLog.push('forceValidation');
    }
    const changeset = this.changesetWebform.changeset;
    if (!this.validates || this.isOmitted || !this.eventLogValidated.length) {
      return;
    }
    const res = await changeset.validate(this.propertyName);
    this._setCustomValidity();
    // TODO document and improve opts.callbacks !== false
    if (
      opts.callbacks !== false &&
      this.changesetWebform.callbacks.afterFieldValidation
    ) {
      this.changesetWebform.callbacks.afterFieldValidation(
        this,
        this.changesetWebform,
        res[0],
      );
    }
    return res[0];
  }
  _setCustomValidity() {
    (this.customValidityEls || []).forEach((el) => {
      el.setCustomValidity((this.validationErrors || []).join());
    });
    this.clonedFields.forEach((clonedField) => {
      clonedField._setCustomValidity();
    });
  }
  pushErrors(errors?: any[]) {
    this.changesetWebform.changeset.pushErrors(this.propertyName, ...errors);
    this.eventLog.push('pushErrors');
    this._setCustomValidity();
  }
  cloneField(opts: any = {}) {
    const newField = { ...this.clonedFieldBlueprint };
    const clone = new this.FormFieldCloneClass(newField);
    clone.cloneId = this.generateCloneId(this);
    clone.id = `${this.id}-clone-${clone.cloneId}`;
    clone.isClone = true;
    clone.changesetWebform = this.changesetWebform;
    clone.masterFormField = this;
    this.clonedFields.push(clone);
    clone.index = this.clonedFields.indexOf(clone);
    clone.fieldLabel = this._cloneFieldLabel(clone, this);
    clone.placeholder = this._clonePlaceholder(clone);
    const lastIndex = this.clonedFields.length - 1;
    this.lastUpdatedClone = {
      // Useful for something like swapping field values between clones.
      index: lastIndex,
      previousValue: null,
    };
    if (!opts.fromData) {
      const fieldValue = this.fieldValue || [];
      fieldValue.push(opts.newCloneValue || newField.defaultValue);
      this.updateValue(fieldValue); // TODO by not calling updatFieldValue int eh component, we don't have the action callback. Attach it to the formField instance.
    }
    this.checkMinMaxClones(this);
  }
  checkMinMaxClones(masterFormField: FormField) {
    if (
      masterFormField.maxClones &&
      masterFormField.clonedFields.length >= masterFormField.maxClones
    ) {
      masterFormField.cloneCountStatus = 'max';
    } else if (
      masterFormField.minClones &&
      masterFormField.clonedFields.length === masterFormField.minClones
    ) {
      masterFormField.cloneCountStatus = 'min';
    } else {
      masterFormField.cloneCountStatus = null;
    }
  }
  generateCloneId(masterFormField: FormField) {
    const startFrom = 1;
    const clonedFields = masterFormField.clonedFields;
    if (!(clonedFields || []).length) {
      return startFrom;
    }
    const sortedClones = [...clonedFields].sort((a, b) => {
      return b.cloneId - a.cloneId;
    });
    return sortedClones[0].cloneId + 1;
  }
  removeClone(clone: FormFieldClone) {
    const index = this.clonedFields.indexOf(clone);
    removeObject(this.clonedFields, clone);
    this.checkMinMaxClones(this);
    const groupValue = this.fieldValue || [];
    groupValue.splice(index, 1);
    this.eventLog.push('removeClone');
    this.updateValue(groupValue); // TODO by not calling updatedFieldValue in the component, we don't have the action callback. Attach it to the formField instance.
    this.clonedFields.forEach((clone, index) => {
      clone.index = index;
    });
  }
  _cloneFieldLabel(clone: FormFieldClone, masterFormField: FormField) {
    if (clone.fieldLabel) {
      return typeof clone.fieldLabel === 'function'
        ? clone.fieldLabel(clone)
        : `${clone.fieldLabel} ${(clone.index + 1).toString()}`;
    }
    return `${masterFormField.fieldLabel} ${(clone.index + 1).toString()}`;
  }
  _clonePlaceholder(clone: FormFieldClone) {
    if (clone.placeholder) {
      return typeof clone.placeholder === 'function'
        ? clone.placeholder(clone)
        : `${clone.placeholder} ${(clone.index + 1).toString()}`;
    }
    return clone.fieldLabel;
  }
}
