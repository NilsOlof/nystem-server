import { Wrapper, DragAndDropView } from "nystem-components";
import { useRef, useState } from "react";

const DragAndDropDraggable = ({ model, className, path }) => {
  const [left, setLeft] = useState(0);
  const [top, setTop] = useState(0);
  const ref = useRef();
  const limit = {};

  return (
    <Wrapper
      ref={ref}
      className={[className, model.className]}
      style={{ left: `${left}px`, top: `${top}px` }}
    >
      <DragAndDropView
        model={{ ...model, limit }}
        onEnd={(pos) => {
          setLeft(pos.x + left);
          setTop(pos.y + top);
        }}
        path={path}
      />
    </Wrapper>
  );
};
export default DragAndDropDraggable;
