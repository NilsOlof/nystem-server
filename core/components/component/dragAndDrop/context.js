import React, { useEffect, useRef } from "react";
import app from "nystem";
import * as mDnd from "./myDnd";

const DragAndDropContext = ({ children }) => {
  const modifiers = useRef({});
  useEffect(() => {
    const checkModifiers = (e) => {
      const { shiftKey, metaKey, ctrlKey, altKey } = e;
      modifiers.current = { shiftKey, metaKey, ctrlKey, altKey };
    };
    document.body.addEventListener("mouseup", checkModifiers);
    return () => {
      document.body.removeEventListener("mouseup", checkModifiers);
    };
  }, []);

  return (
    <mDnd.DragDropContext
      onDragEnd={(e) => {
        app().event("dragAndDropOnDragEnd", { ...modifiers.current, ...e });
      }}
    >
      {children}
    </mDnd.DragDropContext>
  );
};
export default DragAndDropContext;
