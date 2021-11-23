import React, { useEffect, useState } from "react";
import { Wrapper, ContentTypeRender } from "nystem-components";
import app from "nystem";

const ElectronMoveWindow = ({ model, path, children, ...rest }) => {
  const [pos, setPos] = useState(false);
  const { className, renderAs, item } = model || rest;

  useEffect(() => {
    if (!pos) return;
    const { screenX, screenY } = window;

    const mouseMove = async ({ screenX: x, screenY: y }) => {
      app().event("electronEvent", {
        event: "setWindowPos",
        x: x - pos.x + screenX,
        y: y - pos.y + screenY,
      });
    };

    document.addEventListener("mousemove", mouseMove);

    const mouseUp = () => {
      setPos(false);
    };
    document.addEventListener("mouseup", mouseUp);

    return () => {
      document.removeEventListener("mousemove", mouseMove);
      document.removeEventListener("mouseup", mouseUp);
    };
  }, [pos]);

  return (
    <Wrapper
      onMouseDown={({ screenX: x, screenY: y }) => {
        setPos({ x, y });
      }}
      className={className}
      renderAs={renderAs}
    >
      {children || <ContentTypeRender path={path} items={item} />}
    </Wrapper>
  );
};

export default ElectronMoveWindow;
