import React from "react";
import { Wrapper, ContentTypeRender } from "nystem-components";

const BootstrapView = ({ model, path }) => {
  const { className, renderAs, item, row } = model;

  if (row)
    return (
      <Wrapper className={className}>
        <Wrapper className="row">
          <ContentTypeRender path={path} items={item} />
        </Wrapper>
      </Wrapper>
    );

  return (
    <Wrapper className={className} renderAs={renderAs}>
      <ContentTypeRender path={path} items={item} />
    </Wrapper>
  );
};
export default BootstrapView;
