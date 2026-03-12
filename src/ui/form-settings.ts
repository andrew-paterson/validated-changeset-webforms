import { FormSettings as FormSettingsType } from '../types.js';

export default class FormSettings {
  constructor(args: FormSettingsType) {
    for (const key in args) {
      this[key] = args[key];
    }
  }
}
