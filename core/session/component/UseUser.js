import { useEffect, useState } from "react";
import app from "nystem";

let userNow;

const UseUser = () => {
  const [user, setUser] = useState(userNow);

  useEffect(() => {
    let user = userNow;
    const change = ({ ids }) => {
      if (ids && !ids.includes(user._id)) return;
      setUserEv();
    };

    const setUserEv = async () => {
      const { user: sessionUser } = app().session;

      if (user && !sessionUser)
        app().database[user.contentType].off("update", change);
      if (!user && sessionUser)
        app().database[sessionUser.contentType].on("update", change);
      user = sessionUser;

      if (!user) return;

      const { data } = await app().database[user.contentType].get({
        id: user._id,
      });

      userNow = { ...data, contentType: user.contentType };
      setUser(data);
    };

    app().on("login", -10, setUserEv);
    app().on("logout", -10, setUserEv);

    if (userNow === undefined) setUserEv();
    else if (user) app().database[user.contentType].on("update", change);

    return () => {
      if (user) app().database[user.contentType].off("update", change);
      app().off("login", setUserEv);
      app().off("logout", setUserEv);
    };
  }, []);
  return user;
};

export default UseUser;
