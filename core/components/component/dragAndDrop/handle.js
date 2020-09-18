import React, { useContext } from "react";
import { ContentTypeRender, Icon } from "nystem-components";
import { DragAndDropListContext } from "./list";

const DragAndDropHandle = ({ model, path }) => {
  const { item, className = [] } = model;
  const dragHandleProps = useContext(DragAndDropListContext);

  return (
    <div className={className.join(" ")} {...dragHandleProps}>
      {model.icon && <Icon icon="move" className="w-8 h-8 py-2" />}
      <ContentTypeRender path={path} items={item} />
    </div>
  );
};

export default DragAndDropHandle;
