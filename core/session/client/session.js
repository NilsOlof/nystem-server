module.exports = (app) => {
  app.session = app.addeventhandler({}, ["login", "logout"], "session");
  const { session } = app;

  const goto = (path, push) =>
    push
      ? window.history.pushState({}, "", path)
      : window.history.replaceState({}, "", path);

  app.on("init", -1, async () => {
    function loginEvent(user) {
      if (JSON.stringify(user) === JSON.stringify(session.user)) return;

      try {
        app.storage.setItem({ id: `session`, value: user });
        // eslint-disable-next-line no-empty
      } catch (e) {}
      session.user = user;
      if (typeof session.user.role === "string")
        session.user.role = [session.user.role];
      app.event("login", user);
    }

    session.on("login", ({ sessionid, ...data }) =>
      app.connection.emit({
        type: "login",
        sessionid,
        data,
      })
    );

    app.connection.on(
      ["emit", "login"],
      -10,
      async ({ type, user, error, redirectURL, sessionid }) => {
        if (type !== "login") return;

        if (user) {
          if (!error) {
            if (redirectURL) goto(redirectURL, true);
            loginEvent(user);
          }
        } else if (session.user && sessionid === session.user?.sessionid)
          session.logout();

        return { type, user, error };
      }
    );

    const reload = ({ key, id }) => {
      if ((key || id) !== `session`) return;

      setTimeout(() => window.location.reload(), 0);
    };
    window.addEventListener("storage", reload);
    app.storage.on("removeItem", -1000, reload);
    app.storage.on("setItem", -1000, reload);

    session.on("logout", () => {
      delete session.user;

      app.connection.emit({ type: "logout", noCallback: true });

      app.event("clearCacheAndReload");
      app.event("logout");
    });

    app.connection.on("logout", () => {
      app.event("clearCacheAndReload");
    });

    const { value: userStore } = await app.storage.getItem({ id: `session` });
    session.user = userStore;

    if (userStore) {
      if (app.connection.connected) await session.login(userStore);

      app.connection.on("connection", ({ connected }) => {
        if (connected && session.user) session.login(session.user);
      });
    }
  });
};
