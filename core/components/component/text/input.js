import React, { useState } from "react";
import { InputWrapper, Input, Icon, UseValidator } from "nystem-components";
import app from "nystem";
import validate from "./validate";
import "./input.css";

const ClearButton = ({ value, setValue }) =>
  !value ? null : (
    <Icon
      onClick={() => setValue("")}
      className="w-8 h-8 p-2 relative right-8 cursor-pointer"
      icon="close"
      aria-hidden="true"
    />
  );

const TextInput = ({ model, view, focus, setValue, value }, ref) => {
  const [error, setValidated] = UseValidator({ view, validate, value, model });
  const {
    disabled,
    length,
    text,
    clearButton,
    classNameInput = [],
    removeChars = "",
  } = model;
  const [id] = useState(app().uuid);

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
        placeholder={model.placeholder || app().t(text)}
        className={classNameInput}
        value={value || ""}
        maxLength={length}
        onChange={(value) => {
          setValue(
            removeChars
              ? value.replace(new RegExp(`[${removeChars}]`, "g"), "")
              : value
          );
        }}
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
