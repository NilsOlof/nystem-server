import React, { useState, useEffect, useRef } from "react";
import { ContentTypeRender, Wrapper } from "nystem-components";
import app from "nystem";
import { Droppable, Draggable } from "./myDnd";

export const DragAndDropListContext = React.createContext();

const DragAndDropList = ({ value = [], model, path, view }) => {
  const [droppableId] = useState(app().uuid());

  const ids = useRef([]);
  const getId = (pos) => {
    if (!ids.current[pos]) ids.current[pos] = app().uuid();
    return ids.current[pos];
  };

  const { valueType } = model;
  let { field } = model;
  if (field instanceof Array) [field] = field;
  if (!field) field = { id: "item" };

  let valuePath = field.id.substring(field.id.lastIndexOf(".") + 1);
  if (path) valuePath = `${path}.${valuePath}`;

  value = view.getValue(valuePath);
  value = value || [];

  useEffect(() => {
    const onDragEnd = (result) => {
      const value = view.getValue(valuePath) || [];

      let updated = false;

      if (!result.ctrlKey && result.source.droppableId === droppableId) {
        value.splice(result.source.index, 1);
        ids.current.splice(result.source.index, 1);
        updated = true;
      }

      if (
        result.destination &&
        result.destination.droppableId === droppableId
      ) {
        value.splice(result.destination.index, 0, result.source.value);
        ids.current.splice(
          result.destination.index,
          0,
          result.source.droppableId === droppableId
            ? result.source.uuid
            : app().uuid()
        );
        updated = true;
      }

      if (updated) view.setValue({ path: valuePath, value });
    };

    const onDragEndAddValue = (result) => {
      if (result.source.droppableId !== droppableId) return;
      const value = view.getValue(valuePath);
      result.source.value = value[result.source.index];
      result.source.uuid = result.ctrlKey
        ? app().uuid()
        : ids.current[result.source.index];
    };

    app().on("dragAndDropOnDragEnd", 100, onDragEndAddValue);
    app().on("dragAndDropOnDragEnd", onDragEnd);
    return () => {
      app().off("dragAndDropOnDragEnd", onDragEndAddValue);
      app().off("dragAndDropOnDragEnd", onDragEnd);
    };
  }, [droppableId, valuePath, view]);

  if (!(value instanceof Array)) return null;

  return (
    <Droppable droppableId={droppableId} type={valueType}>
      {(provided, snapshot) => (
        <Wrapper
          className={[
            model.className,
            snapshot.isDraggingOver && model.hoverClassName,
          ]}
          {...provided.droppableProps}
          ref={provided.innerRef}
        >
          {value.map((item, index) => (
            <Draggable
              key={getId(index)}
              draggableId={getId(index)}
              index={index}
              minHeight={model.minHeight}
            >
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  style={provided.draggableProps.style}
                >
                  <DragAndDropListContext.Provider
                    value={provided.dragHandleProps}
                  >
                    <ContentTypeRender
                      path={`${valuePath}.${index}`}
                      items={model.item}
                    />
                  </DragAndDropListContext.Provider>
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </Wrapper>
      )}
    </Droppable>
  );
};
export default DragAndDropList;
