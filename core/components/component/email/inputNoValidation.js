import React, { useState } from "react";
import { InputWrapper, Input } from "nystem-components";
import app from "nystem";

const EmailInputNoValidation = ({ model, focus, setValue, value, className }) => {
  const { disabled, length, text, clearButton, classNameInput } = model;
  const [id] = useState(app().uuid);

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
        type="text"
        focus={focus}
      />
    </InputWrapper>
  );
};
export default EmailInputNoValidation;
