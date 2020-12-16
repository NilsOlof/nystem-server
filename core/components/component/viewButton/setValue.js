import React from "react";
import { Button } from "nystem-components";

const ViewButtonSetValue = ({ model, view }) => {
  const value = view.getValue(model.field);
  const modelValue =
    model.value.replace(/[0-9]/, "") === ""
      ? parseInt(model.value, 10)
      : model.value;

  const setValue = () =>
    view.setValue({ path: model.field, value: modelValue });

  return (
    <Button
      type={value === modelValue ? model.btnType : model.falseBtnType}
      size={model.size}
      className={model.className}
      onClick={() => setValue()}
    >
      {value ? model.text : model.falseText || model.text}
    </Button>
  );
};

export default ViewButtonSetValue;
