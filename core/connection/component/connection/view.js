import React, { useState, useEffect } from "react";
import app from "nystem";
import { Wrapper, ContentTypeRender } from "nystem-components";

const ConnectionView = ({ model = {}, offline, className, path, children }) => {
  const [connected, setConnectedState] = useState(app().connection.connected());

  useEffect(() => {
    const update = () => {
      setConnectedState(app().connection.connected());
    };

    app().connection.on("connect", update);
    app().connection.on("disconnect", update);

    return () => {
      app().connection.off("connect", update);
      app().connection.off("disconnect", update);
    };
  });

  className = className || model.className;
  offline = offline || model.offline;

  if ((connected && offline) || (!connected && !offline)) return null;

  if (children) return <Wrapper className={className}>{children}</Wrapper>;

  return (
    <Wrapper className={className}>
      <ContentTypeRender path={path} items={model.item} />
    </Wrapper>
  );
};

export default ConnectionView;
