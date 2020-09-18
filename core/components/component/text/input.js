import React, { useState } from "react";
import { InputWrapper, Input, Icon, UseValidator } from "nystem-components";
import app from "nystem";
import validate from "./validate";

const ClearButton = ({ value, setValue }) =>
  !value ? null : (
    <Icon
      onClick={() => setValue("")}
      className="absolute w-4 right-0 top-0 m-3"
      icon="close"
      aria-hidden="true"
    />
  );

const TextInput = ({ model, view, focus, setValue, value }, ref) => {
  const [error, setValidated] = UseValidator({ view, validate, value, model });
  const { disabled, length, text, clearButton, classNameInput = [] } = model;
  const [id] = useState(app().uuid);

  const contents = (
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
  );

  return model.noWrapper ? (
    contents
  ) : (
    <InputWrapper
      id={id}
      model={{
        ...model,
        classNameInput: "relative flex-grow",
      }}
      error={error}
    >
      {contents}
      {clearButton ? <ClearButton value={value} setValue={setValue} /> : null}
    </InputWrapper>
  );
};
export default React.forwardRef(TextInput);
