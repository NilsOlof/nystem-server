import React, { useContext } from "react";
import { ContentTypeRender, Icon, Wrapper } from "nystem-components";
import { DragAndDropListContext } from "./list";

const DragAndDropHandle = ({ model, path }) => {
  const { item, className = [] } = model;
  const dragHandleProps = useContext(DragAndDropListContext);

  return (
    <Wrapper className={className} {...dragHandleProps}>
      {model.icon && <Icon icon="arrows-up-down" className="w-8 h-8 py-2" />}
      {item && <ContentTypeRender path={path} items={item} />}
    </Wrapper>
  );
};

export default DragAndDropHandle;
