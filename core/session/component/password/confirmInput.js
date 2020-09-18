import React, { useState } from "react";
import app from "nystem";
import { InputWrapper, Input, UseValidator } from "nystem-components";
import validate from "./validate";
import "./confirmInput.css";

const PasswordConfirmInput = ({ model, value, view, setValue }) => {
  const [value1, setValue1] = useState("");
  const [value2, setValue2] = useState("");

  const [error, setValidated] = UseValidator({
    view,
    validate,
    value: [value1, value2],
    model,
  });

  return (
    <InputWrapper model={model} error={error}>
      <div>
        <Input
          placeholder={app().t(model.text)}
          className={[...(model.classNameInput || []), "confirm-input"]}
          value={value1}
          onChange={(svalue) => {
            setValidated(true);
            setValue1(svalue);
            if (svalue === value2) setValue(value1);
            else if (value) setValue("");
          }}
          type="password"
          autoComplete="new-password"
        />
      </div>
      <div>
        <Input
          placeholder={app().t("Repeat")}
          className={[...(model.classNameInput || []), "confirm-input"]}
          value={value2}
          onChange={(svalue) => {
            setValidated(true);
            setValue2(svalue);
            if (svalue === value1) setValue(value1);
            else if (value) setValue("");
          }}
          type="password"
          autoComplete="new-password"
        />
      </div>
    </InputWrapper>
  );
};
export default PasswordConfirmInput;
