import React, { useState, useEffect } from "react";
import app from "nystem";
import { Wrapper } from "nystem-components";

const ConnectionConnectedCount = ({ model }) => {
  const [count, setCount] = useState(false);

  useEffect(() => {
    app()
      .connection.event("emit", { type: "count" })
      .then(({ connectedCount }) => {
        setCount(connectedCount);
      });
  }, []);

  if (!count) return null;
  return <Wrapper className={model.className}>{count} connected</Wrapper>;
};
export default ConnectionConnectedCount;
