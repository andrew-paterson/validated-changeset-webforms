function dasherize(str: string): string {
  // Insert dashes between camelCase boundaries, replace underscores/spaces with dashes
  return String(str)
    .replace(/([a-z\d])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .replace(/-+/g, '-');
}

export default function safeName(str: string): string {
  if (!str) {
    return '';
  }
  str = dasherize(str).toLowerCase();

  str = str
    .replace(/\s/g, '-')
    .replace(/-+/g, '-')
    .replace(/\./g, '_')
    .replace(/[^0-9a-z_-]/g, '');
  return str;
}
