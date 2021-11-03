import React, { useState, useEffect, useCallback, useMemo } from "react";
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

const pick = (fields, value) =>
  fields
    ? fields.reduce(
        (prev, [id, to]) => (value[id] ? { ...prev, [to]: value[id] } : prev),
        {}
      )
    : value;

const ViewButtonEventEmitter = ({ model, view, path }) => {
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

  useEffect(() => {
    if (!emitter.on) return;

    const checkActive = () => {
      setActive(false);
    };

    emitter.on(model.event, checkActive);
    return () => {
      emitter.off(model.event, checkActive);
    };
  }, [emitter, model.event, view.value._id]);

  const sendEvent = async () => {
    await emitter.event(model.event, {
      event: model.subEvent,
      value: active ? false : pick(model.fields, view.value),
      contentType: view.contentType,
    });
    if (model.inactiveClass || model.activeClass) setActive(!active);
  };

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

  return <EventButton model={model} view={view} path={path} />;
};
export default ViewButtonEventEmitter;
