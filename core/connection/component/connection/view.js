import React, { useState, useEffect } from "react";
import app from "nystem";
import { Wrapper, ContentTypeRender } from "nystem-components";

const ConnectionView = ({ model = {}, offline, className, path, children }) => {
  const isConnected = () => app().connection.connected();
  const [connected, setConnectedState] = useState(isConnected());

  useEffect(() => {
    const update = () => setConnectedState(isConnected());

    app().connection.on("connect", update);
    app().connection.on("disconnect", update);
    if (connected !== isConnected()) setConnectedState(isConnected());

    return () => {
      app().connection.off("connect", update);
      app().connection.off("disconnect", update);
    };
  }, [connected]);

  className = className || model.className;
  offline = offline || model.offline;

  if ((connected && offline) || (!connected && !offline)) return null;

  return (
    <Wrapper className={className}>
      {children || <ContentTypeRender path={path} items={model.item} />}
    </Wrapper>
  );
};

export default ConnectionView;
