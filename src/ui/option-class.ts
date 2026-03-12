import { Option as OptionType } from '../types.js';

export default class Option {
  // label: string;
  // value: any;
  // key: string | number;

  constructor(args: OptionType) {
    for (const key in args) {
      this[key] = args[key];
    }
  }
}

new Option({ value: 'foo' });
