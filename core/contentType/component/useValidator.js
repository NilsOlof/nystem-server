import { useState, useEffect } from "react";

const UseValidator = ({ validate, view, model, value }) => {
  const [isValidated, setValidated] = useState(view && view.isValidated);
  const error = isValidated && validate({ value, model });

  useEffect(() => {
    const validator = async ({ errors, silent }) => {
      if (!silent) setValidated(true);

      const error = await Promise.resolve(validate({ value, model }) || false);
      if (error) errors = [...(errors || []), error];
      return errors ? { errors, silent } : undefined;
    };

    const clearErrorValidation = () => {
      setValidated(false);
    };
    if (!view) return;
    view.on("validate", validator);
    view.on("clearErrorValidation", clearErrorValidation);

    return () => {
      if (!view) return;
      view.off("validate", validator);
      view.off("clearErrorValidation", clearErrorValidation);
    };
  }, [view, validate, value, model]);

  return [error, setValidated];
};
export default UseValidator;
