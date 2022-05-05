import React from "react";
import { Button, Wrapper } from "nystem-components";

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

  return btnType ? (
    <Button type={type} className={model.className} onClick={handleChange}>
      {text || "..."}
    </Button>
  ) : (
    <Wrapper className={model.className} onClick={handleChange}>
      {text || "..."}
    </Wrapper>
  );
};

export default SelectButton;
