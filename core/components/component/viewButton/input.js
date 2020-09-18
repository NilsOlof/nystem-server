import React, { useState, useEffect, useMemo, useCallback } from "react";
import app from "nystem";
import { Button, Wrapper } from "nystem-components";
import { withRouter } from "react-router";

const baseButtonStates = {
  default: {
    text: "Save",
    type: "secondary",
  },
  saving: {
    text: "Saving ...",
    type: "warning",
  },
  success: {
    text: "Saved",
    type: "success",
  },
  deleted: {
    text: "Undo delete",
    type: "warning",
  },
};

const ViewButtonInput = ({ view, model, value, history, location }) => {
  const { text, btnType } = model;

  const buttonStates = useMemo(
    () =>
      text
        ? {
            ...baseButtonStates,
            default: {
              text,
              type: `${btnType || "secondary"}`,
            },
          }
        : baseButtonStates,
    [btnType, text]
  );
  const [button, setButton] = useState("default");
  const [error, setError] = useState(false);
  const [savedTimer, setSavedTimer] = useState(false);
  const [activeKeySaveView, setActiveKeySaveView] = useState(false);

  const inactivateKeySaveView = () => {
    setActiveKeySaveView(false);
  };
  const activateKeySaveView = () => {
    app().event("inactivateKeySaveView");
    setActiveKeySaveView(true);
  };
  const handleCancel = () => {
    if (view.event("cancel")) view.event("reload");
  };
  const handleDelete = () => {
    if (view.event("delete"))
      app()
        .database[view.contentType].delete({ id: view.value._id })
        .then(() => setButton("deleted"));
  };

  const handleSubmit = useCallback(async () => {
    if (button !== "default") return;
    if (app().settings.debug) console.log(value);

    const { errors } = await view.event("validate");
    if (errors) {
      setError("Correct validation errors", errors);
      return;
    }
    setError(false);
    setButton("saving");

    const { data, error } = await app().database[view.contentType].save({
      data: { ...value },
      view: view.format,
    });

    console.log("zzave", { data, error }, value._id);

    if (error) {
      view.event("error", error);
      setButton("default");
      return;
    }

    const saved = await view.event("save", data);
    const { pathname } = location;

    if (data && view.value._id && view.value._id !== data._id) {
      history.replace(
        pathname.replace(`/${view.value._id}`, `/${data._id || ""}`)
      );
      return;
    }

    if (!model.noRedirect && !view.value._id) {
      view.setValue({ path: "_id", value: data._id });
      history.replace(`${model.redirectURL || pathname}/${data._id || ""}`);
      return;
    }

    if (!saved) return;

    setButton("success");
    setSavedTimer(
      setTimeout(() => {
        setButton("default");
        setSavedTimer(false);
      }, 1000)
    );
  }, [button, history, location, model, value, view]);

  useEffect(() => () => savedTimer && clearTimeout(savedTimer), [savedTimer]);

  useEffect(() => {
    const handleKeySave = () => {
      if (activeKeySaveView) handleSubmit();
    };

    view.on("submit", handleSubmit);
    app().on("keypressSaveEvent", handleKeySave);
    app().on("inactivateKeySaveView", inactivateKeySaveView);
    view.on("change", activateKeySaveView);

    return () => {
      view.off("submit", handleSubmit);
      view.off("change", activateKeySaveView);
      app().off("keypressSaveEvent", handleKeySave);
      app().off("inactivateKeySaveView", inactivateKeySaveView);
    };
  }, [activeKeySaveView, handleSubmit, view]);

  return (
    <>
      <Wrapper className={model.className}>
        <Button onClick={handleSubmit} type={buttonStates[button].type}>
          {app().t(buttonStates[button].text)}
        </Button>
        {button === "default" && !model.sendOnly && view.value._id && (
          <>
            <Button onClick={handleCancel} type="warning">
              Cancel
            </Button>
            <Button onClick={handleDelete} type="danger">
              {app().t("Delete")}
            </Button>
          </>
        )}
      </Wrapper>
      {error && <Wrapper className="red">{error}</Wrapper>}
    </>
  );
};

export default withRouter(ViewButtonInput);
