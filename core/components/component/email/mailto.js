import React from "react";
import { Wrapper, ContentTypeRender } from "nystem-components";

const EmailMailto = ({ model, value, path }) => {
  const { className, item } = model;

  return (
    <Wrapper renderAs="a" href={`mailto:${value}`} className={className}>
      <ContentTypeRender items={item} />
    </Wrapper>
  );
};

export default EmailMailto;
