import { useState, useEffect } from "react";
import { InputWrapper, Input } from "nystem-components";
import app from "nystem";

const EmailInputNoValidation = ({
  model,
  focus,
  setValue,
  value,
  className,
  view,
}) => {
  const { disabled, length, text, clearButton, classNameInput } = model;
  const [id] = useState(app().uuid);

  useEffect(() => {
    if (!model.mandatory) return;

    const validator = async ({ errors, silent }) => {
      const error = !value;
      if (error) errors = [...(errors || []), error];
      return errors ? { errors, silent } : undefined;
    };
    view.on("validate", validator);

    return () => {
      view.off("validate", validator);
    };
  }, [view, value, model]);

  const componentClassName = [
    className,
    ...(model.className || []),
    "textInput",
  ];
  if (clearButton) componentClassName.push("flex");

  return (
    <InputWrapper id={id} model={model} className={componentClassName}>
      <Input
        id={id}
        placeholder={app().t(text)}
        className={classNameInput}
        value={value || ""}
        maxLength={length}
        onChange={(value) => setValue(value)}
        disabled={disabled}
        type="email"
        focus={focus || model.focus}
      />
    </InputWrapper>
  );
};
export default EmailInputNoValidation;
