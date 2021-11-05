import React, { useContext } from "react";
import { Wrapper, ContentTypeRender } from "nystem-components";

import { HideOnNotOverContext } from "./onOverHandle";

const StyleOnOverRemove = ({ model, path, children }) => {
  const { className, item, invert } = model;
  let over = useContext(HideOnNotOverContext);
  if (invert) over = !over;
  if (over)
    return (
      <Wrapper className={className}>
        {children || <ContentTypeRender path={path} items={item} />}
      </Wrapper>
    );

  return null;
};
export default StyleOnOverRemove;
