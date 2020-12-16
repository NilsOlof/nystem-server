import React from "react";
import { Wrapper, ContentTypeRender } from "nystem-components";

const MultilinetextItemLink = ({ value, model, path }) => (
  <Wrapper
    renderAs="a"
    className={model.className}
    href={`http://${value}`}
    rel="noopener noreferrer"
    target="_blank"
  >
    <ContentTypeRender path={path} items={model.item} />
  </Wrapper>
);
export default MultilinetextItemLink;
