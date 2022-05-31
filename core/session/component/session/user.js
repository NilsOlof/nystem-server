import React, { useEffect, useState } from "react";
import app from "nystem";
import { ContentTypeView } from "nystem-components";

const useUser = () => {
  const [user, setUser] = useState();

  useEffect(() => {
    const setUserEv = async () => {
      const { _id, contentType } = app().session.user;
      const { data } = await app().database[contentType].get({ id: _id });

      setUser(data);
    };

    app().on("login", -10, setUserEv);
    app().on("logout", -10, setUserEv);
    setUserEv();

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
        contentType={contentType}
        format={toFormat}
        value={user}
        baseView={view}
      />
    );

  return null;
};
export default SessionUser;
