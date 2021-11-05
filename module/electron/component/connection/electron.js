import React, { useRef, useEffect } from "react";
import app from "nystem";
import { Wrapper } from "nystem-components";

const ConnectionElectron = ({ model = {} }) => {
  const atId = useRef(false);

  useEffect(() => {
    const message = (data) => {
      if (!atId.current || data.atId !== atId.current) return;
      console.log(data.filePaths);
    };
    app().on("electronData", message);

    return () => {
      app().off("electronData", message);
    };
  }, []);

  return (
    <Wrapper
      onClick={() => {
        atId.current = app().uuid();

        app().event("electronEvent", { event: "dialog", atId: atId.current });
      }}
    >
      hepp
    </Wrapper>
  );
};

export default ConnectionElectron;
