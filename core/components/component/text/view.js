import React from "react";
import { Wrapper } from "nystem-components";

const TextView = ({ model, value }) => {
  const className = model.className ? model.className.join(" ") : "";
  return (
    <Wrapper
      className={className}
      renderAs={model.renderAs}
      translate={model.translate}
    >
      {value || model.fallback}
    </Wrapper>
  );
};
export default TextView;
