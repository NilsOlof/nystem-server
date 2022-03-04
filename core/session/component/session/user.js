import React, { useEffect, useState } from "react";
import app from "nystem";
import { ContentTypeView } from "nystem-components";

const useUser = () => {
  const [user, setUser] = useState();

  useEffect(() => {
    const setUserEv = () => {
      setUser(app().session.user);
    };

    app().on("login", -10, setUserEv);
    app().on("logout", -10, setUserEv);
    setUser(app().session.user);

    return () => {
      app().off("login", setUserEv);
      app().off("logout", setUserEv);
    };
  }, []);
  return user;
};

const SessionUser = ({ view, model, ...rest }) => {
  const { contentType, toFormat } = model || rest;
  const user = useUser();

  if (user)
    return (
      <ContentTypeView
        key={user.userid}
        contentType={contentType || view.contentType}
        format={toFormat}
        id={user._id}
        baseView={view}
      />
    );

  return null;
};
export default SessionUser;
