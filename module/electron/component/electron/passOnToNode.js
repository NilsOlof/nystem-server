import { useEffect } from "react";
import app from "nystem";

const ElectronPassOnToNode = ({ model, view }) => {
  const emitterByType = {
    connection: {
      event: (type, data) => app().connection.emit({ type, ...data }),
      on: app().connection.on,
      off: app().connection.off,
    },
    view: view,
    baseView: view.baseView,
    baseViewBaseView: view.baseView?.baseView,
    baseViewBaseViewBaseView: view.baseView?.baseView?.baseView,
    app: app(),
  };
  const emitter = emitterByType[model.eventType || "connection"];

  useEffect(() => {
    if (!emitter.on) return;
    const sendEvent = (data) => app().event("electronEvent", data);

    emitter.on(model.event, sendEvent);
    return () => {
      emitter.off(model.event, sendEvent);
    };
  }, [emitter, model]);

  return null;
};
export default ElectronPassOnToNode;
