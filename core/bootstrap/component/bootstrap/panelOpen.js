import React, { useContext } from "react";
import { Wrapper, ContentTypeRender, PanelContext } from "nystem-components";

const classNames = (className) =>
  !className ? [] : className instanceof Array ? className : [className];

const BootstrapPanelOpen = ({ model, path, children }) => {
  const { className, item, classNameOpen, classNameClosed } = model;
  const { expanded } = useContext(PanelContext);

  return (
    <Wrapper
      className={[
        ...classNames(className),
        ...(expanded ? classNames(classNameOpen) : classNames(classNameClosed)),
      ]}
    >
      {children || <ContentTypeRender path={path} items={item} />}
    </Wrapper>
  );
};
export default BootstrapPanelOpen;
