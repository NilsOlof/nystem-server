import React from "react";
import { ContentTypeRender } from "nystem-components";

const BootstrapVerticalTab = ({ model, path }) => {
  const createItem = (item, index) => (
    <ContentTypeRender key={index} path={path} items={[item]} />
  );

  const className = model.className ? model.className.join(" ") : "";
  return <ul className={className}>{model.item.map(createItem)}</ul>;
};

export default BootstrapVerticalTab;
