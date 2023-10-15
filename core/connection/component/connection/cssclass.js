import { useState, useEffect } from "react";
import app from "nystem";
import { Wrapper, ContentTypeRender } from "nystem-components";

const ConnectionCssclass = ({ children, path, model }) => {
  const [connected, setConnected] = useState(app().connection.connected);

  useEffect(() => {
    const update = () => setConnected(app().connection.connected);
    app().connection.on("connection", update);
    return () => {
      app().connection.off("connection", update);
    };
  });

  const connectionClass =
    (connected ? model.onlineClass : model.offlineClass) || "";

  return (
    <Wrapper className={[model.className, connectionClass]}>
      {children || <ContentTypeRender path={path} items={model.item} />}
    </Wrapper>
  );
};

export default ConnectionCssclass;
