import React, { useContext } from "react";
import { Wrapper, ContentTypeRender } from "nystem-components";

import { HideOnNotOverContext } from "./onOverHandle";

const StyleOnOver = ({ model, path, children }) => {
  const { className = [], item, classNameOut = [], classNameOver = [] } = model;
  const over = useContext(HideOnNotOverContext);

  return (
    <Wrapper
      className={[...className, ...(over ? classNameOver : classNameOut)]}
    >
      {children || <ContentTypeRender path={path} items={item} />}
    </Wrapper>
  );
};
export default StyleOnOver;
