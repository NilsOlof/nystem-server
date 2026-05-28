import { useState, useEffect } from "react";
import { ContentTypeRender } from "nystem-components";
import app from "nystem";
import { Droppable, Draggable } from "./myDnd";
import { DragAndDropListContext } from "./list";

const DragAndDropView = ({ value, path, ...model }) => {
  if (model.model) model = { ...model, ...model.model };
  const [droppableId] = useState(model.droppableId || app.uuid());

  useEffect(() => {
    if (!value) return;

    const onDragEndAddValue = (result) => {
      if (result.source.droppableId !== droppableId) return;
      result.source.value = value;
      result.source.uuid = droppableId;
    };

    app.on("dragAndDropOnDragEnd", 100, onDragEndAddValue);
    return () => {
      app.off("dragAndDropOnDragEnd", onDragEndAddValue);
    };
  }, [value, droppableId]);

  const { item, handle } = model;
  return (
    <Droppable
      droppableId={droppableId}
      type={model.valueType}
      isDropDisabled={true}
    >
      {(provided) => {
        return (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            <Draggable
              key={droppableId}
              draggableId={droppableId}
              index={0}
              minHeight={model.minHeight}
              limit={model.limit}
              onMove={model.onMove}
              onEnd={model.onEnd}
              transform={model.transform}
            >
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
                        <ContentTypeRender path={path} items={item} />
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
