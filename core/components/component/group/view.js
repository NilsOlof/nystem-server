import React from "react";
import { Wrapper, ContentTypeRender } from "nystem-components";

const GroupView = ({ view, model, path }) => (
  <Wrapper className={model.className}>
    <ContentTypeRender
      items={model.item}
      path={view.getValuePath(path, model.id)}
    />
  </Wrapper>
);
export default GroupView;
