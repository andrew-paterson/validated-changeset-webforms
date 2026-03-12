export default function validateClone(options: any = {}) {
  return (key, newValue, oldValue, changes, content) => {
    const allCloneValidations = [];
    options.validationRules = options.validationRules || [];
    newValue = newValue || [];
    newValue.forEach((item, index) => {
      if (
        (
          (options.validationRules[0] &&
            options.validationRules[0].activateValidation) ||
          []
        ).indexOf(index) < 0
      ) {
        allCloneValidations.push([]);
        return;
      }
      let thisCloneValidations = [];
      options.validationRules.forEach((cloneValidation) => {
        const func = options.validators[cloneValidation.validationMethod](
          cloneValidation.arguments,
        );
        const validationResult = func(key, item, oldValue, changes, content);
        if (validationResult !== true) {
          thisCloneValidations.push(validationResult);
        }
      });
      if (
        thisCloneValidations.every((item) => {
          return item === true;
        })
      ) {
        thisCloneValidations = [];
      }
      allCloneValidations.push(thisCloneValidations);
    });
    if (
      allCloneValidations.every((item) => {
        return item.length === 0;
      })
    ) {
      return true;
    }
    return { clones: allCloneValidations };
  };
}
