import { useState, useEffect } from "react";
import app from "nystem";
import { Wrapper, ContentTypeRender } from "nystem-components";

const ViewButtonEventSpinner = ({ model, view, path }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const emitterByType = {
      connection: {
        on: (evtype, prio, func) => app.connection.on("emit", prio, func),
        off: (type, func) => app.connection.off("emit", func),
      },
      view: view,
      baseView: view.baseView,
      baseViewBaseView: view.baseView?.baseView,
      baseViewBaseViewBaseView: view.baseView?.baseView?.baseView,
      app: app,
    };
    const emitter = emitterByType[model.eventType || "view"];

    let mounted = true;
    let timer = false;
    let count = 0;
    let setShowPre = async () => {
      count++;
      if (!timer) {
        timer = setTimeout(() => {
          timer = false;
          if (mounted) setShow(true);
        }, model.delay || 100);
      }
    };

    let setShowPost = async () => {
      if (--count) return;
      if (timer) {
        clearTimeout(timer);
        timer = false;
      } else if (mounted) setShow(false);
    };

    if (model.eventType === "connection") {
      setShowPre = async ({ type }) => {
        if (type !== model.event) return;
        count++;
        if (!timer)
          timer = setTimeout(() => {
            timer = false;
            if (mounted) setShow(true);
          }, model.delay || 100);
      };

      setShowPost = async ({ type }) => {
        if (type !== model.event) return;
        if (--count) return;
        if (timer) {
          clearTimeout(timer);
          timer = false;
        } else if (mounted) setShow(false);
      };
    }

    emitter.on(model.event, 50000, setShowPre);
    emitter.on(model.event, -50000, setShowPost);

    return () => {
      mounted = false;
      emitter.off(model.event, setShowPre);
      emitter.off(model.event, setShowPost);
    };
  }, [model, view]);

  if (show)
    return (
      <Wrapper className={model.className}>
        <ContentTypeRender path={path} items={model.item} />
      </Wrapper>
    );
  return null;
};
export default ViewButtonEventSpinner;
