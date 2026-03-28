import type { FieldSchema } from '../types.js';
import safeName from '../utils/safe-name.js';
import FieldsBaseClass from '../utils/fields-base-class.js';
import type FormField from './form-field.js';

export default class FormFieldClone extends FieldsBaseClass {
  masterFormField: FormField;
  // Presentation / config
  cloneActionsPosition?: FieldSchema['cloneActionsPosition'];
  // Runtime wiring (assigned by parser/create functions)
  cloneId?: number | null;
  eventLog: string[] = [];

  constructor(args) {
    super();
    for (const key in args) {
      this[key] = args[key];
    }
  }

  get typeClass() {
    return `cwf-clone-type-${safeName(this.fieldType)}`;
  }

  get fieldValue() {
    const groupValue = this.masterFormField.fieldValue;
    const index = this.index;
    if (!groupValue) {
      return null;
    }
    return groupValue[index];
  }

  get eventLogValidated() {
    return this.validatesOn.filter((eventName) =>
      this.eventLog.includes(eventName),
    );
  }

  get validationErrors() {
    return (
      this.changesetWebform.changeset.get(
        `error.${this.masterFormField.fieldId}.validation`,
      ) || []
    );
  }

  get required() {
    return this.validationRules.find(function (rule) {
      return (
        rule.validationMethod === 'validatePresence' &&
        (rule.arguments === true || rule.arguments.presence === true)
      );
    })
      ? true
      : false;
  }

  get cloneValidationErrors() {
    const index = this.index;
    const changeset = this.changesetWebform.changeset;
    const validationErrors =
      changeset.get(`error.${this.masterFormField.fieldId}.validation`) || [];
    const cloneValidationErrors = validationErrors.find((item) => {
      return typeof item === 'object' || item.clones;
    });
    if (!cloneValidationErrors) {
      return null;
    }
    return cloneValidationErrors.clones[index];
  }

  get validates() {
    return this.validationRules.length > 0;
  }

  get wasValidated() {
    if (!this.eventLogValidated.length) {
      return null;
    }
    return true;
  }

  get validationStatus() {
    if (!this.wasValidated) {
      return null;
    }
    const clonedFieldValidationErrors = this.cloneValidationErrors || [];
    if (clonedFieldValidationErrors.length === 0) {
      return 'valid';
    } else {
      return 'invalid';
    }
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

  get labelId() {
    return `${this.id}-label`;
  }

  get ariaErrorMessage() {
    return (this.cloneValidationErrors || []).length
      ? `${this.id}-errors`
      : null;
  }

  get ariaLabel() {
    if (this.fieldLabel && this.hideLabel) {
      return this.fieldLabel;
    }
    if (!this.fieldLabel && this.masterFormField.fieldLabel) {
      return `${this.masterFormField.fieldLabel} ${this.index + 1}`;
    }
    return null;
  }

  get ariaLabelledBy() {
    if (!this.hideLabel && this.requiresAriaLabelledBy) {
      return this.labelId;
    }
    return null;
  }

  get ariaDescribedBy() {
    return this.fieldDescription ? `${this.id}-description` : null;
  }

  updateValidationActivation() {
    if (this.eventLogValidated.length && this.validationRules[0]) {
      const validationRules = this.validationRules[0];
      validationRules.activateValidation =
        validationRules.activateValidation || [];
      validationRules.activateValidation.push(this.index);
    }
  }

  _setCustomValidity() {
    (this.customValidityEls || []).forEach((el) => {
      el.setCustomValidity((this.cloneValidationErrors || []).join());
    });
  }
}
