import { useState, useEffect } from "react";
import { InputWrapper, Input } from "nystem-components";
import app from "nystem";

let isInstalled =
  navigator.standalone || matchMedia("(display-mode: standalone)").matches;

const ServiceWorkerSelectBox = ({ model, view }) => {
  const [install, setInstall] = useState(false);
  const [id] = useState(app().uuid);

  useEffect(() => {
    if (!install) return;
    app()
      .event("canRunAppInstall")
      .then(({ installable }) => {
        isInstalled = isInstalled || !installable;
      });

    const runInstall = () => app().event("runAppInstall");

    view.on(["save"], runInstall);
    app().on(["login"], runInstall);
    return () => {
      view.off(["save"], runInstall);

      setTimeout(() => {
        app().off(["login"], runInstall);
      }, 200);
    };
  }, [install, view]);

  return isInstalled ? null : (
    <InputWrapper id={id} model={model} error={false}>
      <Input
        id={id}
        className={model.classNameInput}
        checked={install}
        onChange={() => setInstall(!install)}
        disabled={model.disabled}
        type="checkbox"
      />
    </InputWrapper>
  );
};

export default ServiceWorkerSelectBox;
