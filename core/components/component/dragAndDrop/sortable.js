import { useState, useEffect } from "react";
import app from "nystem";
import { Droppable, Draggable } from "./myDnd";
import { DragAndDropListContext } from "./list";

const DragAndDropSortable = ({ Component, items = [], setValue, handle }) => {
  const [droppableId] = useState(app.uuid());
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

    app.on("dragAndDropOnDragEnd", onDragEnd);
    return () => {
      app.off("dragAndDropOnDragEnd", onDragEnd);
    };
  }, [items, setValue, droppableId]);

  if (!items.length) return null;

  return (
    <Droppable droppableId={droppableId} type={items[0].contentType}>
      {(provided) => (
        <div {...provided.droppableProps} ref={provided.innerRef}>
          {items.map((item, index) => (
            <Draggable key={item.id} draggableId={item.id} index={index}>
              {(provided) => {
                if (handle)
                  return (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      style={provided.draggableProps.style}
                    >
                      <DragAndDropListContext.Provider
                        value={provided.dragHandleProps}
                      >
                        <Component {...item} key={item.key} />
                      </DragAndDropListContext.Provider>
                    </div>
                  );

                return (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={provided.draggableProps.style}
                  >
                    <Component {...item} key={item.key} />
                  </div>
                );
              }}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default DragAndDropSortable;
