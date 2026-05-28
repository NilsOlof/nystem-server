import React, { useEffect } from "react";
import app from "nystem";

const RoleView = ({ model, setValue }) => {
  useEffect(() => {
    const sessionChange = () => {
      const session = app.session.user || {};
      const { fields } = model;

      if (!fields || !fields.length) {
        setValue(false, session);
      } else {
        fields.forEach((field) => {
          setValue(field, session[field]);
        });
      }
    };

    // Run initial check on mount
    sessionChange();

    // Subscribe to login/logout events
    app.on("login", sessionChange);
    app.on("logout", sessionChange);

    // Cleanup listeners on unmount
    return () => {
      app.off("login", sessionChange);
      app.off("logout", sessionChange);
    };
  }, [model, setValue]); // Re-run if model or setValue changes

  return null;
};

export default RoleView;
