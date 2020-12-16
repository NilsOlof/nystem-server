import React, { useState, useEffect } from "react";
import app from "nystem";
import * as myDnd from "./myDnd";

const DragAndDropSortable = ({ Component, items = [], setValue }) => {
  const { Droppable, Draggable } = myDnd;
  const [droppableId] = useState(app().uuid());
  useEffect(() => {
    if (!items.length) return;

    const onDragEnd = (result) => {
      const value = items.map((item) => item.id);
      let updated = false;

      if (result.source.droppableId === droppableId) {
        value.splice(result.source.index, 1);
        updated = true;
      }

      if (
        result.destination &&
        result.destination.droppableId === droppableId
      ) {
        value.splice(result.destination.index, 0, result.draggableId);
        updated = true;
      }

      if (updated) setValue(value);
    };

    app().on("dragAndDropOnDragEnd", onDragEnd);
    return () => {
      app().off("dragAndDropOnDragEnd", onDragEnd);
    };
  }, [items, setValue, droppableId]);

  if (!items.length) return null;

  return (
    <Droppable droppableId={droppableId} type={items[0].contentType}>
      {(provided, snapshot) => (
        <div {...provided.droppableProps} ref={provided.innerRef}>
          {items.map((item, index) => (
            <Draggable key={item.id} draggableId={item.id} index={index}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  style={provided.draggableProps.style}
                >
                  {<Component {...item} />}
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default DragAndDropSortable;
