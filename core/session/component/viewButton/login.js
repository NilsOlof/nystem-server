import React, { useState } from "react";
import app from "nystem";
import { Button } from "nystem-components";
import { withRouter } from "react-router";

const ViewButtonLogin = ({ view, model, history }) => {
  const [saveButton, setSaveButton] = useState("Log in");

  const handleSubmit = async () => {
    const { errors = [] } = await view.event("validate");

    if (errors.length) {
      view.event("error", "Correct validation errors");
      return;
    }
    setSaveButton("Logging in");
    view.value.contentType = view.contentType;
    const { error } = await app().session.login(view.value);

    if (error === "missing") view.event("error", "Email does not exist");
    else if (error === "password") view.event("error", "Password error");
    else if (model.redirectURL) history.replace(model.redirectURL);

    setSaveButton("Log in");
  };

  return (
    <Button
      className={model.className}
      type={model.btnType}
      size={model.size}
      onClick={handleSubmit}
    >
      {saveButton}
    </Button>
  );
};
export default withRouter(ViewButtonLogin);
