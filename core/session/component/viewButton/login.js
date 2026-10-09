import { useState } from "react";
import app from "nystem";
import { Button } from "nystem-components";

const ViewButtonLogin = ({ view, model }) => {
  const [saveButton, setSaveButton] = useState(app.t("Log in"));

  const handleSubmit = async () => {
    const { errors = [] } = await view.event("validate");

    if (errors.length) {
      view.event("error", "Correct validation errors");
      return;
    }
    setSaveButton("Logging in");
    view.value.contentType = view.contentType;
    const { error } = await app.session.login(view.value);

    if (error === "toomany") view.event("error", "Too many attempts, try again later");
    else if (error) view.event("error", "Wrong login or password");
    else if (model.redirectURL) window.history.replaceState({}, "", model.redirectURL);

    setSaveButton("Log in");
  };

  return (
    <Button className={model.className} type={model.btnType} size={model.size} onClick={handleSubmit}>
      {saveButton}
    </Button>
  );
};
export default ViewButtonLogin;
