import { useState, useEffect } from "react";
import app from "nystem";
import { Wrapper } from "nystem-components";

const Role = ({ role, className, children }) => {
  const getVisibility = () => {
    const { user } = app.session;
    const userRoles = user?.role
      ? ["logged-in", ...(Array.isArray(user.role) ? user.role : [user.role])]
      : ["logged-out"];

    const requiredRoles = role.split(" ");
    return requiredRoles.some((r) => userRoles.includes(r));
  };

  const [visible, setVisible] = useState(getVisibility);

  useEffect(() => {
    const handleSessionChange = () => {
      const isNowVisible = getVisibility();
      setVisible(isNowVisible);
    };

    // Subscribe to events
    app.on("login", handleSessionChange);
    app.on("logout", handleSessionChange);

    return () => {
      app.off("login", handleSessionChange);
      app.off("logout", handleSessionChange);
    };
  }, [role]);

  if (!visible) return null;

  return <Wrapper className={className}>{children}</Wrapper>;
};

export default Role;
