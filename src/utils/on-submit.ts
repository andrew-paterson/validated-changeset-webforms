import preFlightForm from './preflight-form.js';
import ChangesetWebform from '../changeset-webform.js';
import { CwfCallbacks } from '../types.js';

export default async function onSubmit(
  changesetWebform: InstanceType<typeof ChangesetWebform>,
) {
  const callbacks: CwfCallbacks = changesetWebform.callbacks;
  await preFlightForm(changesetWebform);
  if (!changesetWebform.changeset.isValid) {
    return;
  }
  if (callbacks.beforeSubmitForm) {
    await callbacks.beforeSubmitForm(changesetWebform);
  }
  changesetWebform.formSettings.requestInFlight = true;
  let submitActionResponse;
  try {
    const savedChangeset = await changesetWebform.changeset.save();
    submitActionResponse = savedChangeset;
    if (callbacks.submitData) {
      submitActionResponse = await callbacks.submitData(
        savedChangeset.data,
        changesetWebform,
      );
    }
    changesetWebform.formSettings.requestInFlight = false;
    if (changesetWebform.formSettings.clearFormAfterSubmit) {
      changesetWebform.clear();
    }

    if (callbacks.submitSuccess) {
      callbacks.submitSuccess(submitActionResponse, changesetWebform);
    }
    if (callbacks.submitComplete) {
      callbacks.submitComplete(
        'success',
        submitActionResponse,
        changesetWebform,
      );
    }
    return submitActionResponse;
  } catch (err) {
    changesetWebform.formSettings.requestInFlight = false;
    if (callbacks.submitError) {
      callbacks.submitError(err, changesetWebform);
    }
    if (callbacks.submitComplete) {
      callbacks.submitComplete('error', err, changesetWebform);
    }
    return err;
  }
}
