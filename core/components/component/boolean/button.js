import React from "react";
import { Button } from "nystem-components";

const BooleanButton = ({ setValue, model, value }) => (
  <Button
    type={value ? model.btnType : model.falseBtnType}
    size={model.size}
    className={model.className}
    onClick={() => setValue(!value)}
  >
    {value ? model.text : model.falseText || model.text}
  </Button>
);

export default BooleanButton;
