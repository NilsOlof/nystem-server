import React, { useState } from "react";
import app from "nystem";
import { Button } from "nystem-components";
import { withRouter } from "react-router";

const ViewButtonLogin = ({ view, model, history }) => {
  const [saveButton, setSaveButton] = useState("Log in");

  const handleSubmit = async () => {
    const { errors = [] } = await view.event("validate");

    if (!errors.length) {
      view.value.contentType = view.contentType;

      app()
        .session.login(view.value)
        .then(({ error }) => {
          if (error === "missing") {
            view.event("error", "Email does not exist");
            setSaveButton("Log in");
          } else if (error === "password") {
            view.event("error", "Password error");
            setSaveButton("Log in");
          } else if (model.redirectURL) history.replace(model.redirectURL);
        });

      setSaveButton("Logging in");
    } else view.event("error", "Correct validation errors");
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
