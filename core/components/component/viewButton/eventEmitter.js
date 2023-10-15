import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import app from "nystem";
import { Button, Wrapper, ContentTypeRender } from "nystem-components";

const EventButton = ({ model, view, sendEvent }) => {
  const buttonStates = useMemo(
    () => ({
      default: {
        text: model.text ? model.text : "Send",
        type: model.btnType ? model.btnType : "secondary",
      },
      confirm: {
        text: "Are you sure?",
        type: "danger",
      },
      saving: {
        text: "Sending ...",
        type: "warning",
      },
      success: {
        text: "Sent",
        type: "success",
      },
    }),
    [model.btnType, model.text]
  );

  const [button, setButton] = useState(buttonStates.default);
  const [savedTimer, setSavedTimer] = useState(false);
  const [activeKeySaveView, setActiveKeySaveView] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = useCallback(
    async (event) => {
      if (event) event.preventDefault();
      const { errors = [] } = await view.event("validate");
      if (errors.length) {
        setError("Correct validation errors");
        return;
      }

      if (model.confirm && button !== buttonStates.confirm) {
        setButton(buttonStates.confirm);
        setSavedTimer(setTimeout(() => setButton(buttonStates.default), 1000));
      } else {
        setButton(buttonStates.saving);

        const data = await sendEvent();
        setButton(buttonStates.success);
        setSavedTimer(setTimeout(() => setButton(buttonStates.default), 1000));

        if (data.redirectToPath) app().router.click(data.redirectToPath);
      }
    },
    [button, buttonStates, model.confirm, sendEvent, view]
  );

  useEffect(() => {
    const handleKeySave = () => {
      if (activeKeySaveView) handleSubmit();
    };
    const inactivateKeySaveView = () => setActiveKeySaveView(false);
    const activateKeySaveView = () => {
      app().event("inactivateKeySaveView");
      setActiveKeySaveView(true);
    };

    if (model.saveOnKey) {
      view.on("submit", handleSubmit);
      app().on("keypressSaveEvent", handleKeySave);
      app().on("inactivateKeySaveView", inactivateKeySaveView);
      setActiveKeySaveView(false);
      view.on("change", activateKeySaveView);
    }

    return () => {
      if (savedTimer) clearTimeout(savedTimer);
      if (model.saveOnKey) {
        view.off("submit", handleSubmit);
        view.off("change", activateKeySaveView);
        app().off("keypressSaveEvent", handleKeySave);
        app().off("inactivateKeySaveView", inactivateKeySaveView);
      }
    };
  }, [activeKeySaveView, handleSubmit, model.saveOnKey, savedTimer, view]);

  return (
    <>
      <Button
        onClick={handleSubmit}
        className={model.className}
        type={model.btnType}
        size={model.size}
      >
        {app().t(button.text)}
      </Button>
      {error}
    </>
  );
};

const goto = (path) => window.history.replaceState({}, "", path);

const ViewButtonEventEmitter = ({ model, view, path }) => {
  const sendRef = useRef();
  const insertVal = (val) => {
    if (!val) return val;

    return val.replace(/\{([a-z_.0-9]+)\}/gim, (str, p1) => {
      if (p1 === "id") return view.id;

      if (p1.indexOf("params.") === 0)
        return view.params[p1.replace("params.", "")];

      if (p1.indexOf("baseView.") !== 0)
        return view.getValue(p1.replace("..", path));

      p1 = p1.replace("baseView.", "");
      return view.baseView.getValue(p1.replace("..", path));
    });
  };

  const pick = (fields, value) =>
    fields?.reduce((prev, [id, to]) => {
      const val = insertVal(id);
      return val ? { ...prev, [to]: val } : prev;
    }, {});

  const [active, setActive] = useState(false);

  const emitterByType = {
    connection: {
      event: (type, data) => app().connection.emit({ type, ...data }),
    },
    view: view,
    baseView: view.baseView,
    baseViewBaseView: view.baseView?.baseView,
    baseViewBaseViewBaseView: view.baseView?.baseView?.baseView,
    app: app(),
  };
  const emitter = emitterByType[model.eventType || "connection"];

  const sendEvent = async () => {
    let sendData = { event: model.subEvent, contentType: view.contentType };

    if (!active) {
      sendData = {
        ...sendData,
        ...(pick(model.fields) || { value: view.value }),
      };
    }

    const data = await emitter.event(model.event, sendData);

    if (model.inactiveClass || model.activeClass) setActive(!active);
    if (data.redirectURL) goto(data.redirectURL);

    return data;
  };
  sendRef.current = sendEvent;

  useEffect(() => {
    if (!emitter.on) return;
    const send = () => {
      sendRef.current();
    };

    if (model.onSubmit) view.on("submit", send);

    const checkActive = () => {
      setActive(false);
    };

    emitter.on(model.event, checkActive);
    return () => {
      emitter.off(model.event, checkActive);
      if (model.onSubmit) view.off("submit", send);
    };
  }, [emitter, model, view]);

  if (model.item)
    return (
      <Wrapper
        className={[
          model.className,
          active && model.activeClass,
          !active && model.inactiveClass,
        ]}
        onClick={sendEvent}
      >
        <ContentTypeRender path={path} items={model.item} />
      </Wrapper>
    );

  return (
    <EventButton model={model} view={view} path={path} sendEvent={sendEvent} />
  );
};
export default ViewButtonEventEmitter;
