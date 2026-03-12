import ChangesetWebform from '../changeset-webform.js';

export default function nullifyOmittedFields(
  changesetWebform: InstanceType<typeof ChangesetWebform>,
) {
  const notAllowedKeys = changesetWebform.fields
    .filter((field) => {
      return field.isOmitted;
    })
    .map((field) => field.propertyName);
  notAllowedKeys.forEach((path) => {
    if (changesetWebform.changeset.get(path) !== undefined) {
      changesetWebform.changeset.set(path, null);
    }
  });
}
