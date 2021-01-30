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
  let link = insertVal(href);
  if (!/https?:\/\//im.test(link)) link = `https://${link}`;

  return (
    <Wrapper
      className={className}
      href={link}
      target="_blank"
      renderAs="a"
      rel="noopener"
    >
      <ContentTypeRender path={path} items={item} />
    </Wrapper>
  );
};
export default ViewLinkExternal;
