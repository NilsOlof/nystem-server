import React from "react";
import { InputWrapper, Input, UseValidator } from "nystem-components";
import app from "nystem";
import validate from "./validate";

const IntInput = ({ model, view, focus, setValue, value, className }) => {
  const [error, setValidated] = UseValidator({ view, validate, value, model });
  const { disabled, length, text, clearButton } = model;

  const componentClassName = [
    className,
    ...(model.className || []),
    "textInput",
  ];
  if (clearButton) componentClassName.push("flex");

  const inputClassName = ["textInputDefault"];
  if (error) inputClassName.push("textInputError");

  return (
    <InputWrapper
      model={{ ...model, classNameInput: "flex", classNameLabel: " " }}
      error={error}
      className={componentClassName}
    >
      <Input
        placeholder={app().t(text)}
        className={model.classNameInput}
        value={!value && value !== 0 ? "" : value}
        maxLength={length}
        onChange={(value) => {
          const intVal = value.replace(/[^0-9]/gim, "");
          setValue(intVal ? parseInt(intVal, 10) : undefined);
        }}
        disabled={disabled}
        type="text"
        focus={focus}
        onBlur={() => setValidated(true)}
        selectAllOnFocus={model.selectAllOnFocus}
      />
    </InputWrapper>
  );
};
export default IntInput;
