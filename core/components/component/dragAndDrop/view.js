import React, { useState, useEffect } from "react";
import * as reactBeautifulDnd from "react-beautiful-dnd";
import { ContentTypeRender } from "nystem-components";
import app from "nystem";
import * as myDnd from "./myDnd";

const DragAndDropView = ({ value, model, path }) => {
  const { Droppable, Draggable } = model.myDnd ? myDnd : reactBeautifulDnd;
  const [droppableId] = useState(app().uuid());

  useEffect(() => {
    if (!value) return;

    const onDragEndAddValue = (result) => {
      if (result.source.droppableId !== droppableId) return;
      result.source.value = value;
      result.source.uuid = droppableId;
    };

    app().on("dragAndDropOnDragEnd", 100, onDragEndAddValue);
    return () => {
      app().off("dragAndDropOnDragEnd", onDragEndAddValue);
    };
  }, [value, droppableId]);

  const { item } = model;

  return (
    <Droppable
      droppableId={droppableId}
      type={model.valueType}
      isDropDisabled={true}
    >
      {(provided, snapshot) => {
        // console.log(provided);
        return (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            <Draggable key={droppableId} draggableId={droppableId} index={0}>
              {(provided, snapshot) => {
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

export default DragAndDropView;
