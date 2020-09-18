import React from "react";
import app from "nystem";
import { Wrapper } from "nystem-components";

const handleEvent = overlayId => e => {
  e.preventDefault();
  app().event("overlay", { overlayId, event: "open" });
};

const OverlayOpen = ({ overlayId, ...props }) => (
  <Wrapper renderAs="a" {...props} onClick={handleEvent(overlayId)} />
);

export default OverlayOpen;
