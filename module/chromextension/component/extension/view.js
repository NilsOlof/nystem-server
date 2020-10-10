import React from "react";
import { ContentTypeRender } from "nystem-components";

const ExtensionView = ({ invert, model = {}, path, children }) => {
  const inExtension = window.location.protocol === "chrome-extension:";
  invert = invert || model.invert;

  if ((inExtension && invert) || (!inExtension && !invert)) return null;

  return children || <ContentTypeRender path={path} items={model.item} />;
};
export default ExtensionView;
