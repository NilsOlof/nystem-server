import React, { useState, useEffect } from "react";
import { ContentTypeRender } from "nystem-components";
import app from "nystem";
import { Droppable, Draggable } from "./myDnd";

const DragAndDropFixedVal = ({ value, model, path }) => {
  const [droppableId] = useState(app().uuid());

  useEffect(() => {
    if (!value) return;

    const onDragEndAddValue = (result) => {
      if (result.source.droppableId !== droppableId) return;
      result.source.value = JSON.parse(model.setValue);
      result.source.uuid = droppableId;
    };

    app().on("dragAndDropOnDragEnd", 100, onDragEndAddValue);
    return () => {
      app().off("dragAndDropOnDragEnd", onDragEndAddValue);
    };
  }, [value, droppableId, model.setValue]);

  const { item } = model;

  return (
    <Droppable
      droppableId={droppableId}
      type={model.valueType}
      isDropDisabled={true}
    >
      {(provided) => {
        // console.log(provided);
        return (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            <Draggable
              key={droppableId}
              draggableId={droppableId}
              index={0}
              minHeight={model.minHeight}
            >
              {(provided) => {
                // console.log(provided.draggableProps.style);
                return (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={provided.draggableProps.style}
                  >
                    <ContentTypeRender path={path} items={item} />
                  </div>
                );
              }}
            </Draggable>
            {provided.placeholder}
          </div>
        );
      }}
    </Droppable>
  );
};

export default DragAndDropFixedVal;
