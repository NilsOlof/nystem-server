import React from "react";
import { Wrapper, ContentTypeRender } from "nystem-components";

const BootstrapView = ({ model, path }) => {
  const { className, renderAs, item } = model;

  return (
    <Wrapper className={className} renderAs={renderAs}>
      <ContentTypeRender path={path} items={item} />
    </Wrapper>
  );
};
export default BootstrapView;
