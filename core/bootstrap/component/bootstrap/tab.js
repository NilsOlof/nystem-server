import React from "react";
import { Wrapper, ContentTypeRender } from "nystem-components";

const BootstrapTab = ({ model, path }) => {
  const { className, sideways, position, item } = model;
  className.push("nav");
  className.push("nav-tabs");

  if (sideways) className.push("sideways");
  if (position) className.push(position);

  return (
    <Wrapper renderAs="ul" className={className}>
      <ContentTypeRender path={path} items={item || []} />
    </Wrapper>
  );
};
export default BootstrapTab;
