import { useState } from "react";
import { InputWrapper, Input, Button, UseValidator } from "nystem-components";
import app from "nystem";
import validate from "./validate";

const BooleanInput = ({ model, setValue, value, view, render }) => {
  const [error, setValidated] = UseValidator({ view, validate, value, model });
  const [id] = useState(app().uuid);

  const handleChangeButton = () => {
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
    <InputWrapper id={id} model={model} error={error}>
      <Input
        id={id}
        className={model.classNameInput}
        placeholder={model.text}
        checked={value || false}
        onChange={() => setValue(!value)}
        disabled={model.disabled}
        type="checkbox"
      />
    </InputWrapper>
  );
};

export default BooleanInput;
