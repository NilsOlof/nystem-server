// Same as react-beautiful-dnd but more levels than 2

import React, { useState, useRef, useEffect, useContext, useMemo } from "react";
import app from "nystem";

const MyDragAndDropContext = React.createContext();

export const DragDropContext = ({ children, onDragEnd }) => {
  const event = app().addeventhandler();

  useEffect(() => {
    event.on("onDragEnd", onDragEnd);
  }, [event, onDragEnd]);

  return (
    <MyDragAndDropContext.Provider value={{ event, parents: [] }}>
      {children}
    </MyDragAndDropContext.Provider>
  );
};

const styleDraggableItem = {
  boxSizing: "border-box",
  opacity: null,
  pointerEvents: "none",
  position: "fixed",
  transform: null,
  transition: "opacity 0.2s cubic-bezier(0.2, 0, 0, 1)",
  zIndex: 4500,
};
const offsetStyle = {
  transform: "translate(0px,0px)",
  transition:
    "transform 0.33s cubic-bezier(.2,1,.1,1), opacity 0.33s cubic-bezier(.2,1,.1,1)",
};

export const Droppable = ({ droppableId, type, children, isDropDisabled }) => {
  const [style, setStyle] = useState(null);
  const innerRef = useRef();
  const styleRef = useRef();
  styleRef.current = style;

  const context = useContext(MyDragAndDropContext);
  const { event } = context;

  const provided = {
    droppableProps: { style: style || offsetStyle },
    innerRef,
  };

  const parents = useMemo(
    () => [
      ...context.parents,
      ...(context.droppableId ? [context.droppableId] : []),
    ],
    [context.droppableId, context.parents]
  );

  useEffect(() => {
    if (isDropDisabled) return;

    const paddingBottom = parseInt(
      window.getComputedStyle(innerRef.current).paddingBottom,
      10
    );

    const stop = (result) => {
      const size = innerRef.current.getBoundingClientRect();
      setStyle(null);
      const { x, y } = result.pos;

      if (y < size.top || y > size.bottom || x < size.left || x > size.right)
        return;

      if (result.destination.parents.includes(droppableId)) return;

      return {
        ...result,
        destination: { ...result.destination, droppableId, parents },
      };
    };

    const move = (result) => {
      if (!innerRef.current) return;

      const size = innerRef.current.getBoundingClientRect();
      const { x, y } = result;

      if (y < size.top || y > size.bottom || x < size.left || x > size.right)
        return;

      if (result.parents.includes(droppableId)) return;

      return { ...result, over: droppableId, parents };
    };

    const over = ({ over, height }) => {
      if (!innerRef.current) return;

      if (over !== droppableId) {
        if (styleRef.current) setStyle(null);
        return;
      }
      if (!styleRef.current)
        setStyle({ ...offsetStyle, paddingBottom: paddingBottom + height });
    };

    event.on(`${type}Over`, over);
    event.on(`${type}Move`, move);
    event.on(`${type}Stop`, 100, stop);
    return () => {
      event.off(`${type}Over`, over);
      event.on(`${type}Move`, move);
      event.off(`${type}Stop`, stop);
    };
  }, [droppableId, event, isDropDisabled, parents, type]);

  return (
    <MyDragAndDropContext.Provider
      value={{ ...context, parents, droppableId, isDropDisabled, type }}
    >
      {children(provided, {})}
    </MyDragAndDropContext.Provider>
  );
};

export const Draggable = ({ draggableId, index, children, minHeight = 0 }) => {
  const [style, setStyle] = useState(null);

  const innerRef = useRef();
  const { event, droppableId, isDropDisabled, type } = useContext(
    MyDragAndDropContext
  );

  useEffect(() => {
    if (isDropDisabled) return;

    let breakpoint;
    let currentStyle = null;

    let offsetStyleSet = null;
    const start = (props) => {
      currentStyle = null;

      if (props.draggableId === draggableId) return;

      const size = innerRef.current.getBoundingClientRect();
      breakpoint = size.top + size.height / 2;

      offsetStyleSet = {
        ...offsetStyle,
        transform: `translate(0px, ${props.height}px)`,
      };
      setStyle({
        transform:
          props.y > breakpoint
            ? offsetStyle
            : `translate(0px, ${props.height}px)`,
      });
      currentStyle = true;
    };

    const move = (pos) => {
      if (!currentStyle) return;
      const size = innerRef.current.getBoundingClientRect();
      breakpoint = size.top + size.height / 2;

      if (pos.y < breakpoint && droppableId === pos.over) {
        if (currentStyle === offsetStyleSet) return;
        currentStyle = offsetStyleSet;
      } else {
        if (currentStyle === offsetStyle) return;
        currentStyle = offsetStyle;
      }
      setStyle(currentStyle);
    };

    event.on(`${type}Start`, start);
    event.on(`${type}Over`, move);
    return () => {
      event.off(`${type}Start`, start);
      event.off(`${type}Over`, move);
    };
  }, [droppableId, draggableId, event, isDropDisabled, type]);

  useEffect(() => {
    if (isDropDisabled) return;

    const stop = (result) => {
      setStyle(null);
      const { destination } = result;

      const size = innerRef.current.getBoundingClientRect();
      const breakpoint = size.top + size.height / 2;

      if (destination.droppableId !== droppableId) return;
      if (destination.index > index) return;
      if (result.pos.y < breakpoint) return;

      return {
        ...result,
        destination: { ...result.destination, index: index + 1 },
      };
    };

    event.on(`${type}Stop`, stop);
    return () => {
      event.off(`${type}Stop`, stop);
    };
  }, [droppableId, event, index, isDropDisabled, type]);

  const setStyles = (element, styles) =>
    Object.entries(styles).forEach(([prop, val]) => {
      element.style[prop] = val;
    });

  const onMouseDown = (e) => {
    const baseProps = JSON.parse(
      JSON.stringify(innerRef.current.getBoundingClientRect())
    );

    const style = {
      ...styleDraggableItem,
      ...baseProps,
    };
    style.height = style.height < minHeight ? minHeight : style.height;

    const movingState = {
      x: e.clientX - style.left,
      y: e.clientY - style.top,
      height: style.height,
      draggableId,
      droppableId,
      index,
      type,
    };
    let pos = false;
    const clonedElement = innerRef.current.cloneNode(true);

    const mouseMove = (e) => {
      if (!pos) {
        document.body.appendChild(clonedElement);
        setStyles(clonedElement, style);
        clonedElement.style.width = `${baseProps.width}px`;
        event.event(`${type}Start`, movingState);
      }

      pos = {
        x: e.clientX - movingState.x,
        y: e.clientY - movingState.y,
        height: style.height,
        parents: [],
      };

      setStyles(clonedElement, {
        top: `${pos.y}px`,
        left: `${pos.x}px`,
        transform: "scale(1.01,1.15)",
      });
      setStyle({ display: "none" });
      event
        .event(`${type}Move`, pos)
        .then((query) => event.event(`${type}Over`, query));
    };

    const mouseUp = (e) => {
      window.removeEventListener("mousemove", mouseMove);
      window.removeEventListener("mouseup", mouseUp);

      if (!pos) return;

      document.body.removeChild(clonedElement);

      event
        .event(`${type}Stop`, {
          combine: null,
          destination: { index: 0, parents: [] },
          draggableId,
          mode: "FLUID",
          reason: "DROP",
          source: { index, droppableId },
          type,
          pos,
        })
        .then((data) =>
          event.event("onDragEnd", {
            ...data,
            pos: undefined,
          })
        );

      setStyle(null);
      pos = false;
    };

    window.addEventListener("mouseup", mouseUp);
    window.addEventListener("mousemove", mouseMove);
  };

  const onDragStart = (e) => {
    e.preventDefault();
  };

  if (style && style.display === "none") return null;

  const provided = {
    draggableProps: { style },
    dragHandleProps: {
      onMouseDown,
      onDragStart,
      draggable: false,
      role: "button",
      style: {},
    },
    innerRef,
  };
  return children(provided, {});
};

export default () => {};
