import { useEffect } from "react";
import app from "nystem";

const SessionView = ({ view }) => {
  useEffect(() => {
    const sessionChange = () => {
      let session = app().session.user;
      const { fields } = this.props.model;

      if (!session) session = {};

      if (!fields || !fields.length) view.setValue(false, session);
      else
        for (let i = 0; i < fields.length; i++)
          view.setValue(fields[i], session[fields[i]]);
    };

    app().on("login", sessionChange);
    app().on("logout", sessionChange);

    sessionChange();
    return () => {
      app().off("login", sessionChange);
      app().off("logout", sessionChange);
    };
  }, [view]);

  return null;
};
export default SessionView;
