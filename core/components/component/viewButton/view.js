import React from "react";
import app from "nystem";
import { Button } from "nystem-components";

const ViewButtonView = ({ model, view }) => (
  <div className={model.className}>
    <Button
      type={model.btnType}
      onClick={() => view.event(model.event || "submit", view.value)}
    >
      {app().t(model.text || "...")}
    </Button>
  </div>
);

export default ViewButtonView;
