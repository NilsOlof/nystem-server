import React, { useContext } from "react";
import app from "nystem";
import { Wrapper } from "nystem-components";
import { OverlayContextObject } from "./context";

const OverlayClose = ({ className, renderAs, accessible, children }) => {
  const overlayId = useContext(OverlayContextObject);
  const handleEvent = (event) => {
    if (event && event.preventDefault) event.preventDefault();
    app.event("overlay", { overlayId, do: "close" });
  };

  return (
    <Wrapper
      renderAs={renderAs || "a"}
      className={className}
      onClick={handleEvent}
      accessible={accessible}
    >
      {children}
    </Wrapper>
  );
};

export default OverlayClose;
