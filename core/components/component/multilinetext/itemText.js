import React from "react";
import { Wrapper } from "nystem-components";

const MultilinetextItemText = ({ model, value }) => (
  <Wrapper
    className={model.className}
    renderAs={model.renderAs}
    translate={model.translate}
  >
    {value || model.fallback}
  </Wrapper>
);

export default MultilinetextItemText;
