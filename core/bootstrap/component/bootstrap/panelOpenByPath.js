import React from "react";
import { Panel, ContentTypeRender } from "nystem-components";
import { useLocation } from "react-router-dom";

export const BootstrapPanelContext = React.createContext();

const BootstrapPanelOpenByPath = ({ model, path, value, view }) => {
  const { item, header, typeClass } = model;
  const { pathname } = useLocation();

  const insertVal = (val) =>
    val &&
    val.replace(/\{([a-z_.0-9]+)\}/gim, (str, p1, offset, s) => {
      if (/pathItem[0-9]/.test(p1) && view.params) return view.params[p1[8]];
      return view.getValue(p1.replace("..", path));
    });

  const expanded = pathname.match(new RegExp(insertVal(model.match)));

  return (
    <Panel
      {...model}
      forceExpanded={expanded}
      type={typeClass}
      header={<ContentTypeRender path={path} items={header} />}
      body={<ContentTypeRender path={path} items={item} />}
    />
  );
};

export default BootstrapPanelOpenByPath;
