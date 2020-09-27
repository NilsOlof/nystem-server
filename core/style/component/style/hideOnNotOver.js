import React, { useContext } from "react";
import { Wrapper, ContentTypeRender, Icon } from "nystem-components";

import { HideOnNotOverContext } from "./hideOnNotOverHandle";

const StyleHideOnNotOver = ({ model, path, children }) => {
  const { className, item } = model;
  const over = useContext(HideOnNotOverContext);

  return (
    <Wrapper
      className={className}
      style={{ opacity: over ? 1 : 0, transition: "opacity 0.2s ease-out" }}
    >
      {children || <ContentTypeRender path={path} items={item} />}
    </Wrapper>
  );
};
export default StyleHideOnNotOver;
