import React, { useContext } from "react";
import {
  Wrapper,
  ContentTypeRender,
  Icon,
  PanelContext,
} from "nystem-components";

const addClick = (doFunction) => ({
  onClick: doFunction,
  role: "button",
  tabIndex: "0",
});

const BootstrapPanelToggle = ({ model, path, children }) => {
  const { className, item } = model;
  const { toggleExpand, expanded } = useContext(PanelContext);

  return (
    <Wrapper className={className} {...addClick(toggleExpand)}>
      {model.icon && (
        <Icon
          icon={expanded ? "cheveron-down" : "cheveron-right"}
          className={model.iconClassName || "w-6 h-6 pl-0 pointer"}
        />
      )}
      {children || <ContentTypeRender path={path} items={item} />}
    </Wrapper>
  );
};
export default BootstrapPanelToggle;
