import { useEffect, useState } from "react";
import app from "nystem";

let userNow;

const useUser = () => {
  const [user, setUser] = useState(userNow);

  useEffect(() => {
    let user = userNow;
    const change = ({ ids }) => {
      if (ids && !ids.includes(user._id)) return;
      setUserEv();
    };

    const setUserEv = async () => {
      const { user: sessionUser } = app.session;

      if (user && !sessionUser)
        app.database[user.contentType].off("update", change);
      if (!user && sessionUser)
        app.database[sessionUser.contentType].on("update", change);
      user = sessionUser;

      if (!user) return;

      const { get = [] } = app.contentType[user.contentType]._roles;

      let { data } = get.includes(user.role)
        ? await app.database[user.contentType].get({
            id: user._id,
          })
        : {};

      if (!data) data = user;

      userNow = { ...data, contentType: user.contentType };
      setUser(data);
    };

    app.on("login", -10, setUserEv);
    app.on("logout", -10, setUserEv);

    if (userNow === undefined) setTimeout(setUserEv, 0);
    else if (user) app.database[user.contentType].on("update", change);

    return () => {
      if (user) app.database[user.contentType].off("update", change);
      app.off("login", setUserEv);
      app.off("logout", setUserEv);
    };
  }, []);
  return user;
};

export default useUser;
