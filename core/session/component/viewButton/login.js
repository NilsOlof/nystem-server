import { useState } from "react";
import app from "nystem";
import { Button } from "nystem-components";

const ViewButtonLogin = ({ view, model }) => {
  const [saveButton, setSaveButton] = useState(app().t("Log in"));

  const handleSubmit = async () => {
    const { errors = [] } = await view.event("validate");

    if (errors.length) {
      view.event("error", "Correct validation errors");
      return;
    }
    setSaveButton("Logging in");
    view.value.contentType = view.contentType;
    const { error, ...rest } = await app().session.login(view.value);

    if (error === "missing") view.event("error", "Email does not exist");
    else if (error === "password") view.event("error", "Password error");
    else if (model.redirectURL)
      window.history.replaceState({}, "", model.redirectURL);

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
export default ViewButtonLogin;
