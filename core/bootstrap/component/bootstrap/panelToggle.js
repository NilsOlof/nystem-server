import React, { useContext } from "react";
import { Wrapper, ContentTypeRender, Icon } from "nystem-components";

import { PanelContext } from "../panel";

const BootstrapPanelToggle = ({ model, path, children }) => {
  const { className, item } = model;
  const { toggleExpand, expanded } = useContext(PanelContext);

  return (
    <Wrapper className={className} {...toggleExpand}>
      {model.icon && (
        <Icon
          icon={expanded ? "cheveron-down" : "cheveron-right"}
          className="w-8 h-8 p-1 pl-0 pointer"
        />
      )}
      {children || <ContentTypeRender path={path} items={item} />}
    </Wrapper>
  );
};
export default BootstrapPanelToggle;
