import { useEffect, useRef, useState } from "react";
import { Wrapper, ContentTypeRender } from "nystem-components";
import app from "nystem";

const StyleSizeMirror = ({ model, path, ...rest }) => {
  const { mirrorId, host, className, renderAs, item, setWidth, setHeight } =
    model || rest;
  const ref = useRef();
  const [style, setStyle] = useState({});

  useEffect(() => {
    const element = ref.current;

    if (setHeight || setWidth) {
      const setStyleEvent = ({ width, height }) => {
        const style = {};
        if (setHeight) style.height = `${height}px`;
        if (setWidth) style.width = `${width}px`;
        setStyle(style);
      };

      app().on(`StyleSizeMirror${mirrorId}`, setStyleEvent);
      app().event(`StyleSizeMirror${mirrorId}`);

      return () => {
        app().off(`StyleSizeMirror${mirrorId}`, setStyleEvent);
      };
    }

    let { width, height } = ref.current.getBoundingClientRect();
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries)
        if (entry.contentBoxSize) {
          ({ width, height } = entry.contentRect);
          app().event(`StyleSizeMirror${mirrorId}`);
        }
    });

    const setStyleEvent = () => ({ width, height });

    resizeObserver.observe(element);
    app().on(`StyleSizeMirror${mirrorId}`, 10, setStyleEvent);
    app().event(`StyleSizeMirror${mirrorId}`);

    return () => {
      resizeObserver.unobserve(element);
      app().off(`StyleSizeMirror${mirrorId}`, 10, setStyleEvent);
    };
  }, [host, mirrorId, setHeight, setWidth]);

  return (
    <Wrapper ref={ref} style={style} className={className} renderAs={renderAs}>
      {rest.children ||
        (item && item.length ? (
          <ContentTypeRender path={path} items={item} />
        ) : null)}
    </Wrapper>
  );
};

export default StyleSizeMirror;
