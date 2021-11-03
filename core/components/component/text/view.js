import React from "react";
import { Wrapper } from "nystem-components";

const TextView = ({ model, value }) => (
  <Wrapper
    className={model.className}
    renderAs={model.renderAs}
    translate={model.translate}
    title={value || model.fallback}
  >
    {value || model.fallback}
  </Wrapper>
);

export default TextView;
