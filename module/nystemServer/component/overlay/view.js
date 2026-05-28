import React from "react";
import app from "nystem";

const OverlayView = (props) => {
  let { model } = props;
  model = model || props;

  const onClick = (event) => {
    event.preventDefault();
    app().event("addOverlay", model);
  };

  const className = model.className ? model.className.join(" ") : "";
  return (
    <a className={className} href={model.link} onClick={onClick}>
      {app().t(model.text)}
    </a>
  );
};

export default OverlayView;
