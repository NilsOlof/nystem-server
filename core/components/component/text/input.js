import { useState, useEffect } from "react";
import { InputWrapper, Input } from "nystem-components";
import app from "nystem";
import validate from "./validate";
import "./input.css";

const useValidator = ({ validate, view, model, value }) => {
  const [isValidated, setValidated] = useState(false); // view && view.isValidated
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

const TextInput = ({ model, view, focus, setValue, value, ref }) => {
  const [id] = useState(app.uuid);
  const [error, setValidated] = useValidator({ view, validate, value, model });

  const {
    disabled,
    length,
    text,
    clearButton,
    classNameInput = ["grow"],
    removeChars = "",
  } = model;

  return (
    <InputWrapper
      id={id}
      model={{
        ...model,
        classNameInput: "relative flex w-full",
      }}
      error={error}
    >
      <Input
        id={id}
        ref={ref}
        placeholder={model.placeholder || app.t(text)}
        className={classNameInput}
        value={value || ""}
        maxLength={length}
        onChange={(value) => {
          setValue(
            removeChars
              ? value.replace(new RegExp(`[${removeChars}]`, "g"), "")
              : value,
          );
        }}
        disabled={disabled}
        type={clearButton ? "search" : "text"}
        focus={model.focus || focus}
        onBlur={() => setValidated(true)}
        selectAllOnFocus={model.selectAllOnFocus}
      />
    </InputWrapper>
  );
};
export default TextInput;
