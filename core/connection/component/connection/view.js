import { useState, useEffect } from "react";
import app from "nystem";
import { Wrapper, ContentTypeRender } from "nystem-components";

const ConnectionView = ({ model = {}, offline, className, path, children }) => {
  const [connected, setConnectedState] = useState();

  useEffect(() => {
    const update = ({ connected }) => setConnectedState(connected);

    app().connection.on("connection", update);
    setConnectedState(app().connection.connected);

    return () => {
      app().connection.off("connection", update);
    };
  }, []);

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
