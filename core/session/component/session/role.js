import React, { useState, useEffect } from "react";
import app from "nystem";
import { Wrapper, ContentTypeRender } from "nystem-components";

const contains = (array1, array2) => {
  if (!(array1 instanceof Array)) array1 = [array1];
  if (!(array2 instanceof Array)) array2 = [array2];
  for (let i = 0; i < array1.length; i++)
    if (array2.indexOf(array1[i]) !== -1) return true;

  return false;
};

const SessionRole = ({ userrole, model = {}, children, path, className }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => {
      let reqRole = model.role || userrole;
      reqRole = typeof reqRole === "string" ? reqRole.split(" ") : reqRole;

      const { role } = app().session.user || {};

      const userRole = role ? ["logged-in"].concat(role) : "logged-out";

      setVisible(contains(userRole, reqRole));
    };

    app().on("logout", -1000, updateVisibility);
    app().on("login", -1000, updateVisibility);

    updateVisibility();
    return () => {
      app().off("login", updateVisibility);
      app().off("logout", updateVisibility);
    };
  }, [model.role, userrole]);

  if (!visible) return null;

  if (children)
    return (
      <Wrapper className={model.className || className}>{children}</Wrapper>
    );

  return (
    <Wrapper className={model.className}>
      <ContentTypeRender path={path} items={model.item} />
    </Wrapper>
  );
};

export default SessionRole;
