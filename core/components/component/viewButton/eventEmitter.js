import React, { useState, useEffect, useCallback } from "react";
import app from "nystem";
import { Button } from "nystem-components";

const ViewButtonEventEmitter = ({ model, view }) => {
  const buttonStates = {
    default: {
      text: model.text ? model.text : "Send",
      type: model.btnType ? model.btnType : "secondary"
    },
    confirm: {
      text: "Are you sure?",
      type: "danger"
    },
    saving: {
      text: "Sending ...",
      type: "warning"
    },
    success: {
      text: "Sent",
      type: "success"
    }
  };

  const [error, setError] = useState(false);
  const [button, setButton] = useState(buttonStates.default);
  const [savedTimer, setSavedTimer] = useState(false);
  const [activeKeySaveView, setActiveKeySaveView] = useState(false);

  const sendEvent = useCallback(() => {
    setError(false);
    setButton(buttonStates.saving);

    app()
      .connection.emit({
        type: model.event,
        event: model.subEvent,
        value: view.value,
        contentType: view.contentType
      })
      .then(data => {
        setButton(buttonStates.success);
        setSavedTimer(setTimeout(() => setButton(buttonStates.default), 1000));
        if (data.redirectToPath) app().router.click(data.redirectToPath);
      });
  }, [buttonStates, model, view.contentType, view.value]);

  const handleSubmit = useCallback(
    event => {
      if (app().settings.debug) console.log(view.value);
      if (event) event.preventDefault();

      if (view.valid()) {
        if (model.confirm && button !== buttonStates.confirm) {
          setButton(buttonStates.confirm);
          setSavedTimer(
            setTimeout(() => setButton(buttonStates.default), 1000)
          );
        } else sendEvent();
      } else setError("Correct validation errors");
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
      >
        {app().t(button.text)}
      </Button>
      {error}
    </>
  );
};
export default ViewButtonEventEmitter;
