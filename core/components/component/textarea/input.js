import { forwardRef, useState } from "react";
import { InputWrapper, Input, UseValidator } from "nystem-components";
import app from "nystem";
import validate from "./validate";

const TextInput = ({ model, view, focus, setValue, value }, ref) => {
  const [error, setValidated] = UseValidator({ view, validate, value, model });
  const { disabled, length, text, classNameInput = [] } = model;
  const [id] = useState(app().uuid);

  const style = model.height && { height: `${model.height}px` };
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
      type="textarea"
      focus={model.focus || focus}
      onBlur={() => setValidated(true)}
      selectAllOnFocus={model.selectAllOnFocus}
      style={style}
    />
  );

  return model.noWrapper ? (
    contents
  ) : (
    <InputWrapper
      id={id}
      model={{
        ...model,
        classNameInput: "relative flex-grow flex",
      }}
      error={error}
    >
      {contents}
    </InputWrapper>
  );
};
export default forwardRef(TextInput);
