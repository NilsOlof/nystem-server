import React from "react";
import app from "nystem";
import { Button, Wrapper } from "nystem-components";

const ViewButtonView = ({ model, view }) => (
  <Wrapper className={model.className}>
    <Button
      type={model.btnType}
      onClick={() => view.event(model.event || "submit", view.value)}
    >
      {app().t(model.text || "...")}
    </Button>
  </Wrapper>
);

export default ViewButtonView;
