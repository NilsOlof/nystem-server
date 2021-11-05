import React, { useEffect, useState, useContext, useRef, useMemo } from "react";
import {
  DatabaseSearchContext,
  Wrapper,
  ContentTypeRender,
  ContentTypeView,
} from "nystem-components";
import app from "nystem";
import { Droppable, Draggable } from "./myDnd";
import { DragAndDropListContext } from "./list";

const DragAndDropViewList = ({ model, view }) => {
  const [droppableId] = useState(app().uuid());
  const { search } = useContext(DatabaseSearchContext);
  const ids = useRef([]);
  const getId = (pos) => {
    if (!ids.current[pos]) ids.current[pos] = app().uuid();
    return ids.current[pos];
  };

  const { emptyFields, className = [], valueType } = model;
  const value = useMemo(() => (search && search.data) || [], [search]);

  useEffect(() => {
    const onDragEnd = (result) => {
      if (result.destination.droppableId !== droppableId) return;

      result.destination.id = view.id;
      result.destination.value = value;
      result.destination.type = valueType;
      result.destination.contentType = view.contentType;
    };

    const onDragEndAddValue = (result) => {
      if (result.source.droppableId !== droppableId) return;

      result.source.value = value[result.source.index];
      result.source.type = valueType;
      result.source.contentType = view.contentType;
      result.source.uuid = result.ctrlKey
        ? app().uuid()
        : ids.current[result.source.index];
    };

    app().on("dragAndDropOnDragEnd", 100, onDragEndAddValue);
    app().on("dragAndDropOnDragEnd", 90, onDragEnd);
    return () => {
      app().off("dragAndDropOnDragEnd", onDragEndAddValue);
      app().off("dragAndDropOnDragEnd", onDragEnd);
    };
  }, [droppableId, value, valueType, view]);

  if (value.length === 0 && emptyFields && emptyFields.length > 0)
    return (
      <Wrapper className={className}>
        <ContentTypeRender items={emptyFields} />
      </Wrapper>
    );

  const createItem = (item) => {
    const id = ["number", "string"].includes(typeof item) ? item : item._id;

    const settings = {
      view: model,
      contentType: view.contentType,
      id,
      key: id,
      noForm: true,
      baseView: view,
      params: view.params,
      className: model.rowClassName,
      renderAs: item.renderAs,
    };

    return <ContentTypeView {...settings} />;
  };

  return (
    <Droppable droppableId={droppableId} type={valueType}>
      {(provided) => (
        <Wrapper
          className={className}
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
                <Wrapper
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  style={provided.draggableProps.style}
                >
                  <DragAndDropListContext.Provider
                    value={provided.dragHandleProps}
                  >
                    {createItem(item)}
                  </DragAndDropListContext.Provider>
                </Wrapper>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </Wrapper>
      )}
    </Droppable>
  );
};
export default DragAndDropViewList;
