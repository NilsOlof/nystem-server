import React from "react";
import { Wrapper, ContentTypeRender } from "nystem-components";

const ElectronView = ({ model, path, children, ...args }) => {
  const { className, renderAs, item, invert } = model || args;
  if ((!window.electron && !invert) || (window.electron && invert)) return null;

  return (
    <Wrapper className={className} renderAs={renderAs}>
      {children || <ContentTypeRender path={path} items={item} />}
    </Wrapper>
  );
};
export default ElectronView;
