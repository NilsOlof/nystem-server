import React from "react";
import { Wrapper } from "nystem-components";

const BooleanName = ({ model, value }) =>
  value ? <Wrapper className={model.className}>{model.text}</Wrapper> : null;

export default BooleanName;
