import React, { useState, useEffect } from "react";
import app from "nystem";
import { UseLocation } from "nystem-components";
import { OverlayContextProvider } from "./context";

let atPath = "";

const OverlayIndex = ({ children, match }) => {
  // eslint-disable-next-line prefer-const
  let [open, setOpenState] = useState({});
  const { pathname: path } = UseLocation();

  const overlayEvent = ({ event, overlayId }) => {
    if (event === "open") open[overlayId] = true;
    else if (event === "close") {
      if (overlayId) delete open[overlayId];
      else open = {};
    }
    setOpenState(open);
  };

  useEffect(() => {
    app().on("overlay", overlayEvent);
    return () => {
      app().off("overlay", overlayEvent);
    };
  });

  if (path !== atPath) app().event("overlay", { event: "close" });
  atPath = path;

  const items =
    children instanceof Array ? children : children ? [children] : [];

  return items
    .filter(({ props }) => open[props.overlayId])
    .map((child) => (
      <OverlayContextProvider
        key={child.props.overlayId}
        value={child.props.overlayId}
      >
        {child}
      </OverlayContextProvider>
    ));
};

export default OverlayIndex;
