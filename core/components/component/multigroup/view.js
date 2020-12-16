import React from "react";
import { Wrapper, ContentTypeRender } from "nystem-components";

const MultigroupView = ({ value, view, model, path }) => {
  const { className, rowClassName } = model;

  value = value || [];
  return (
    <Wrapper className={className}>
      {value.map((item, index) => (
        <Wrapper key={index} className={rowClassName}>
          <ContentTypeRender items={model.item} path={`${path}.${index}`} />
        </Wrapper>
      ))}
    </Wrapper>
  );
};

export default MultigroupView;
