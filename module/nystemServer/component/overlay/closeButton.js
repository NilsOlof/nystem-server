import React from "react";
import app from "nystem";
import { Wrapper } from "nystem-components";

const OverlayCloseButton = ({
  model,
  view,
  path,
  className: propClassName,
}) => {
  const handleEvent = (event) => {
    event.preventDefault();
    const toPath = path || view.contentType + "/" + view.format + "/" + view.id;
    app.event("closeOverlay", toPath).then((data) => {});
  };

  const className =
    propClassName || (model.className ? model.className.join(" ") : "");

  return (
    <Wrapper
      renderAs={model.renderAs || "a"}
      className={className}
      onClick={handleEvent}
    >
      {model.item.map(view.createItem)}
    </Wrapper>
  );
};

export default OverlayCloseButton;
