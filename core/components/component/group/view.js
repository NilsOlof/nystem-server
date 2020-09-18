import React from "react";
import { Wrapper, ContentTypeRender } from "nystem-components";

const GroupView = ({ model, path }) => (
  <Wrapper className={model.className}>
    <ContentTypeRender items={model.item} path={path} />
  </Wrapper>
);
export default GroupView;
