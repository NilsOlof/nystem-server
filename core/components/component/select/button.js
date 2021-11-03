import React from "react";
import { Button } from "nystem-components";

const SelectButton = ({ model, setValue, value }) => {
  const { trueState, trueOnState, falseState, btnType, falseOnState } = model;

  const handleChange = () =>
    setValue(trueOnState.indexOf(value) ? trueState : falseState);

  let text = "";
  let type = false;

  if (trueOnState.indexOf(value) !== -1) {
    ({ text } = model);
    type = btnType;
  } else if (falseOnState.indexOf(value) !== -1) {
    text = model.falseText;
    type = model.falseBtnType;
  }

  return (
    <Button type={type} className={model.className} onClick={handleChange}>
      {text || "..."}
    </Button>
  );
};

export default SelectButton;
