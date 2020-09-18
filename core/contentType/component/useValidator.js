import { useState, useEffect } from "react";

const UseValidator = ({ validate, view, model, value }) => {
  const [isValidated, setValidated] = useState(view && view.isValidated);
  const error = isValidated && validate({ value, model });

  useEffect(() => {
    const validator = async ({ errors }) => {
      setValidated(true);

      const error = await Promise.resolve(validate({ value, model }) || false);
      if (error) errors = [...(errors || []), error];
      return errors ? { errors } : undefined;
    };
    if (!view) return;
    view.on("validate", validator);

    return () => {
      if (!view) return;
      view.off("validate", validator);
    };
  }, [view, validate, value, model]);

  return [error, setValidated];
};
export default UseValidator;
