/* eslint-disable jsx-a11y/mouse-events-have-key-events */

import React, { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Wrapper, ContentTypeRender } from "nystem-components";

const Portal = ({ children }) => {
  const [element, setElement] = useState(false);

  useEffect(() => {
    const element = document.createElement("div");
    document.body.appendChild(element);
    setElement(element);

    return () => {
      document.body.removeChild(element);
    };
  }, []);

  if (!element) return null;

  return createPortal(children, element);
};

const MouseOver = ({ children, setOver }) => {
  const [isOver, setIsOver] = useState(false);
  const ref = useRef();
  useEffect(() => {
    if (!isOver) return;

    const size = ref.current.getBoundingClientRect();
    let pos = false;

    const mouseMove = (e) => {
      pos = { x: e.clientX, y: e.clientY };
      const { x, y } = pos;

      if (y < size.top || y > size.bottom || x < size.left || x > size.right) {
        setOver(false);
        setIsOver(false);
      }
    };
    const delay = setTimeout(() => {
      setOver(pos);
    }, 100);

    window.addEventListener("mousemove", mouseMove);
    return () => {
      clearTimeout(delay);
      window.removeEventListener("mousemove", mouseMove);
    };
  }, [isOver, setOver]);

  return (
    <div ref={ref} onMouseOver={() => setIsOver(true)}>
      {children}
    </div>
  );
};

const ViewTextTitlePopup = ({ model, path }) => {
  const { item, popup } = model;

  const [overPos, setOver] = useState(false);

  return (
    <>
      {overPos && (
        <Portal>
          <Wrapper
            style={{
              position: "fixed",
              left: overPos.x + 10,
              top: overPos.y + 12,
            }}
          >
            <ContentTypeRender path={path} items={popup} />
          </Wrapper>
        </Portal>
      )}
      <MouseOver setOver={setOver}>
        <ContentTypeRender path={path} items={item} />
      </MouseOver>
    </>
  );
};
export default ViewTextTitlePopup;
