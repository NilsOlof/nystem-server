import React from "react";
import app from "nystem";
import { Button } from "nystem-components";

const isInstalled =
  navigator.standalone || matchMedia("(display-mode: standalone)").matches;

const ServiceWorkerView = ({ model }) =>
  isInstalled ? null : (
    <div className={model.className}>
      <Button type={model.btnType} onClick={() => app().event("runAppInstall")}>
        {app().t(model.text || "...")}
      </Button>
    </div>
  );

export default ServiceWorkerView;

if (navigator.standalone) {
  console.log("Launched: Installed (iOS)");
} else if (matchMedia("(display-mode: standalone)").matches) {
  console.log("Launched: Installed");
} else {
  console.log("Launched: Browser Tab");
}
