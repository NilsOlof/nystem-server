import React, { useState, useEffect } from "react";
import app from "nystem";
import { Wrapper } from "nystem-components";

const ViewSmallComponentErrorMsg = ({ view, model }) => {
  const [error, setError] = useState(false);

  useEffect(() => {
    const errorSetter = error => {
      setError(error);
    };
    view.on("error", errorSetter);

    return () => {
      view.off("error", errorSetter);
    };
  });

  const className = model.className ? model.className.join(" ") : "";

  if (error)
    return (
      <Wrapper className={`text-red-500 ml-32 pl-12 ${className}`}>
        {app().t(error)}
      </Wrapper>
    );
  return null;
};

export default ViewSmallComponentErrorMsg;
