import React from "react";
import { Wrapper, ContentTypeRender } from "nystem-components";

const MultigroupOneView = ({ model, path }) => {
  const className = model.rowClassName ? model.rowClassName.join(" ") : "";

  return (
    <Wrapper className={className}>
      <ContentTypeRender items={model.items} path={path} />
    </Wrapper>
  );
};

export default MultigroupOneView;
