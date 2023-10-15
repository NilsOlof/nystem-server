import { useState } from "react";
import { InputWrapper, Input, UseValidator } from "nystem-components";
import app from "nystem";
import validate from "./validate";

const EmailInput = ({ model, view, focus, setValue, value, className }) => {
  const [error, setValidated] = UseValidator({ view, validate, value, model });
  const { disabled, length, text, clearButton, classNameInput } = model;
  const [id] = useState(app().uuid);

  const componentClassName = [
    className,
    ...(model.className || []),
    "textInput",
  ];
  if (clearButton) componentClassName.push("flex");

  return (
    <InputWrapper
      id={id}
      model={model}
      error={error}
      className={componentClassName}
    >
      <Input
        id={id}
        placeholder={app().t(text)}
        className={classNameInput}
        value={value || ""}
        maxLength={length}
        onChange={(value) => setValue(value.toLowerCase())}
        disabled={disabled}
        type="email"
        focus={focus}
        onBlur={() => setValidated(true)}
      />
    </InputWrapper>
  );
};
export default EmailInput;
