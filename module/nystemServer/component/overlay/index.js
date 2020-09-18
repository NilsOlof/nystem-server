import React, { useState, useEffect } from "react";
import app from "nystem";
import { withRouter } from "react-router";
import { OverlayContextProvider } from "./context";

let atPath = "";

const OverlayIndex = withRouter(({ children, match }) => {
  let [open, setOpenState] = useState({});

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

  const { path } = match;
  if (path !== atPath) app().event("overlay", { event: "close" });
  atPath = path;

  const items =
    children instanceof Array ? children : children ? [children] : [];

  return items
    .filter(({ props }) => open[props.overlayId])
    .map(child => (
      <OverlayContextProvider
        key={child.props.overlayId}
        value={child.props.overlayId}
      >
        {child}
      </OverlayContextProvider>
    ));
});

export default OverlayIndex;
