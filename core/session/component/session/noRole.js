import React, { useState, useEffect } from "react";
import app from "nystem";
import { Wrapper, ContentTypeRender } from "nystem-components";

const hasNoRole = user => user && !user.role;

const SessionNoRole = ({ model = {}, children, path, className }) => {
  const [visible, setVisible] = useState(hasNoRole(app().session.user));

  useEffect(() => {
    const check = () => {
      setVisible(hasNoRole(app().session.user));
    };

    app().on("logout", check);
    app().on("login", check);

    return () => {
      app().off("login", check);
      app().off("logout", check);
    };
  }, []);

  if (!visible) return null;

  className = model.className || className;

  if (children) return <Wrapper className={className}>{children}</Wrapper>;

  return (
    <Wrapper className={className}>
      <ContentTypeRender path={path} items={model.item} />
    </Wrapper>
  );
};

export default SessionNoRole;
