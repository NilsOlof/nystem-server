import React from "react";

const OverlayContextObject = React.createContext();

const OverlayContext = OverlayContextObject.Consumer;
export default OverlayContext;

export { OverlayContextObject };
export const OverlayContextProvider = OverlayContextObject.Provider;
