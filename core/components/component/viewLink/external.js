import React from "react";
import { Wrapper, ContentTypeRender } from "nystem-components";

const ViewLinkExternal = ({ view, path, model }) => {
  const insertVal = (val) => {
    if (!val) return val;
    return val.replace(/\{([a-z_.0-9]+)\}/gim, (str, p1, offset, s) => {
      if (/pathItem[0-9]/.test(p1) && view.params) return view.params[p1[8]];
      return view.getValue(p1.replace("..", path));
    });
  };

  const { className, item, href } = model;

  return (
    <Wrapper
      className={className}
      href={`https://${insertVal(href).replace(/https?:\/\//, "")}`}
      target="_blank"
      renderAs="a"
      rel="noopener"
    >
      <ContentTypeRender path={path} items={item} />
    </Wrapper>
  );
};
export default ViewLinkExternal;
