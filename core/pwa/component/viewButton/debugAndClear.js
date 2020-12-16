import React from "react";
import app from "nystem";
import { Button, Wrapper, UseEvent } from "nystem-components";

const ViewButtonDebugAndClear = ({ model }) => {
  const { appVersion } = UseEvent("getAppVersion");
  return (
    <Wrapper className={model.className}>
      <Wrapper className="mb-2">App version: {appVersion || ""}</Wrapper>
      <Wrapper className="mb-2">
        The button below will require you to log in again.
      </Wrapper>
      <Button
        type={model.btnType}
        onClick={() => app().event("clearCacheAndReload")}
      >
        {app().t(model.text || "...")}
      </Button>
    </Wrapper>
  );
};

export default ViewButtonDebugAndClear;
