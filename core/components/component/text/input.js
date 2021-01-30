import React, { useState } from "react";
import { InputWrapper, Input, Icon, UseValidator } from "nystem-components";
import app from "nystem";
import validate from "./validate";
import "./input.css";

const ClearButton = ({ value, setValue }) =>
  !value ? null : (
    <>
      <Icon
        onClick={() => setValue("")}
        className="w-8 h-8 p-2 relative left-12 cursor-pointer"
        icon="close"
        aria-hidden="true"
      />
      <div className="flex-grow" />
    </>
  );

const TextInput = ({ model, view, focus, setValue, value }, ref) => {
  const [error, setValidated] = UseValidator({ view, validate, value, model });
  const { disabled, length, text, clearButton, classNameInput = [] } = model;
  const [id] = useState(app().uuid);

  return (
    <InputWrapper
      id={id}
      model={{
        ...model,
        classNameInput: "relative flex-grow flex",
      }}
      error={error}
    >
      <Input
        id={id}
        ref={ref}
        placeholder={model.placeholder || app().t(text)}
        className={classNameInput}
        value={value || ""}
        maxLength={length}
        onChange={(value) => setValue(value)}
        disabled={disabled}
        type="text"
        focus={model.focus || focus}
        onBlur={() => setValidated(true)}
        selectAllOnFocus={model.selectAllOnFocus}
      />
      {clearButton ? <ClearButton value={value} setValue={setValue} /> : null}
    </InputWrapper>
  );
};
export default React.forwardRef(TextInput);
