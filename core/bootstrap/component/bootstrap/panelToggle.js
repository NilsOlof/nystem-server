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
          icon={expanded ? "chevron-down" : "chevron-right"}
          className={model.iconClassName || "pointer h-6 w-6 p-1 pl-0"}
        />
      )}
      {children || <ContentTypeRender path={path} items={item} />}
    </Wrapper>
  );
};
export default BootstrapPanelToggle;
