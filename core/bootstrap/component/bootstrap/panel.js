import React from "react";
import { Panel, ContentTypeRender } from "nystem-components";

export const BootstrapPanelContext = React.createContext();

const BootstrapPanel = ({ model, path }) => {
  const { item, header, typeClass } = model;

  return (
    <Panel
      {...model}
      type={typeClass}
      header={<ContentTypeRender path={path} items={header} />}
      body={<ContentTypeRender path={path} items={item} />}
    />
  );
};
export default BootstrapPanel;
