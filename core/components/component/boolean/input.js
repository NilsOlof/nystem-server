import React from "react";
import { InputWrapper, Input, Button, UseValidator } from "nystem-components";
import validate from "./validate";

const BooleanInput = ({ model, setValue, value, view, render }) => {
  const [error, setValidated] = UseValidator({ view, validate, value, model });

  const handleChangeButton = (e) => {
    setValidated(true);
    setValue(!value);
  };

  if (model.render === "button" || render === "button")
    return (
      <Button
        type={value ? "primary" : "secondary"}
        className={model.className}
        onClick={handleChangeButton}
        size="xs"
      >
        {model.text}
      </Button>
    );

  return (
    <InputWrapper model={model} error={error}>
      <Input
        placeholder={model.text}
        checked={value}
        onChange={() => setValue(!value)}
        disabled={model.disabled}
        type="checkbox"
      />
    </InputWrapper>
  );
};

export default BooleanInput;
