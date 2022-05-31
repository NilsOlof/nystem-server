import React from "react";
import app from "nystem";
import { Button } from "nystem-components";

const ViewButtonView = ({ model, view }) => (
  <Button
    className={model.className}
    type={model.btnType}
    size={model.size}
    onClick={() => view.event(model.event || "submit", view.value)}
  >
    {app().t(model.text || "...")}
  </Button>
);

export default ViewButtonView;
