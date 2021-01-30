import React, { useState } from "react";
import { InputWrapper, Input } from "nystem-components";
import app from "nystem";

const PasswordInput = ({ model, value, setValue }) => {
  const { disabled, text, classNameInput = [] } = model;
  const [id] = useState(app().uuid);

  return (
    <InputWrapper model={model} id={id}>
      <Input
        id={id}
        placeholder={app().t(text)}
        className={classNameInput || "sm:w-1/2 w-full"}
        value={value || ""}
        onChange={setValue}
        type="password"
        disabled={disabled}
      />
    </InputWrapper>
  );
};

export default PasswordInput;
