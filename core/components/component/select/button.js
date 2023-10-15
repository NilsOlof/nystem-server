import { Button, Wrapper } from "nystem-components";

const translate = (val) => {
  if (val === undefined) return "undefined";
  if (val === false) return "false";
  if (val === true) return "true";
  if (val === "false") return false;
  if (val === "true") return true;
  if (val === "undefined") return undefined;
  return val;
};

const SelectButton = ({ model, setValue, value }) => {
  const { trueState, falseState, btnType, falseOnState } = model;
  let { trueOnState } = model;
  if (!trueOnState) trueOnState = trueState;

  const handleChange = () =>
    setValue(
      translate(trueOnState) === value
        ? translate(falseState)
        : translate(trueState)
    );

  let text = "";
  let type = false;

  if (translate(trueOnState) === value) {
    ({ text } = model);
    type = btnType;
  } else if (!falseOnState || translate(falseOnState) === value) {
    text = model.falseText;
    type = model.falseBtnType;
  }

  return btnType ? (
    <Button
      type={type}
      className={model.className}
      size={model.size}
      onClick={handleChange}
    >
      {text || "..."}
    </Button>
  ) : (
    <Wrapper className={model.className} onClick={handleChange}>
      {text || "..."}
    </Wrapper>
  );
};

export default SelectButton;
