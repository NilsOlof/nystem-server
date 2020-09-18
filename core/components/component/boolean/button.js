import React from "react";
import { Button } from "nystem-components";

const BooleanButton = ({ setValue, model, value }) => (
  <Button
    style={value ? model.btnType : model.falseBtnType}
    className={model.className}
    onClick={() => setValue(!value)}
  >
    {value ? model.text : model.falseText}
  </Button>
);

export default BooleanButton;
