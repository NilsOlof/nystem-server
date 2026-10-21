import React, { useState } from "react";
import { ContentTypeRender } from "nystem-components";

const ExtensionView = ({ invert, model = {}, path, children, type }) => {
  const inExtension = window.location.protocol === "chrome-extension:";
  const [currentType] = useState(() =>
    !inExtension
      ? "web"
      : window.location.pathname === "/background.js"
        ? "background"
        : window.location.pathname === "/popup.html"
          ? "popup"
          : "content",
  );
  const viewType = type || (model.type !== "extension" && model.type);
  invert = invert || model.invert;

  if (viewType) {
    if (!viewType.split(/\s+/).includes(currentType)) return null;
  } else if ((inExtension && invert) || (!inExtension && !invert)) return null;

  return children || <ContentTypeRender path={path} items={model.item} />;
};
export default ExtensionView;
