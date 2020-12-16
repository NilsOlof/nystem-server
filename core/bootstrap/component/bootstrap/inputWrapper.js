import React from "react";
import { InputWrapper, ContentTypeRender } from "nystem-components";

const BootstrapInputWrapper = ({ model, path }) => {
  const { item } = model;

  return (
    <InputWrapper model={model}>
      <ContentTypeRender path={path} items={item} />
    </InputWrapper>
  );
};
export default BootstrapInputWrapper;
