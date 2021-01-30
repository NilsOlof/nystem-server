import React, { useState } from "react";
import { Input, Wrapper, InputWrapper } from "nystem-components";
import app from "nystem";

const SliderInput = ({ model, setValue, value }) => {
  const [id] = useState(app().uuid);
  const val = model.absolute ? value : ((value - model.min) / model.max) * 100;
  const display = model.precision
    ? parseFloat(val).toFixed(model.precision)
    : parseInt(val, 10);

  return (
    <InputWrapper id={id} model={model} className={model.className}>
      <Input
        id={id}
        placeholder={app().t(model.text)}
        className="w-full"
        value={parseInt(value * 10, 10) || 0}
        onChange={(value) => setValue(value / 10)}
        type="range"
        min={model.min * 10}
        max={model.max * 10}
      />
      <Wrapper className={model.textClass}>{`(${display || 0}%)`}</Wrapper>
    </InputWrapper>
  );
};

export default SliderInput;
