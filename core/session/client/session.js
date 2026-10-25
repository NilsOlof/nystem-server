export default (app) => {
  app.session = app.addeventhandler({}, ["login", "logout"], "session");
  const { session } = app;

  const goto = (path, push) =>
    push ? window.history.pushState({}, "", path) : window.history.replaceState({}, "", path);

  app.on("init", -1, async () => {
    function loginEvent(user) {
      if (JSON.stringify(user) === JSON.stringify(session.user)) return;

      try {
        app.storage.setItem({ id: `session`, value: user });
        // eslint-disable-next-line no-empty
      } catch (e) {}
      session.user = user;
      if (typeof session.user.role === "string") session.user.role = [session.user.role];
      app.event("login", user);
    }

    session.on("login", async ({ sessionid, ...data }) => {
      const query = { type: "login", sessionid, data };
      const response = await app.connection.emit(query);
      if (response === query) return { type: "login", error: "Connection lost", offline: true };
      return app.connection.event("login", response);
    });

    app.connection.on("login", -10, async ({ type, user, error, redirectURL, sessionid, offline }) => {
      if (type !== "login" || offline) return;

      if (user) {
        if (!error) {
          if (redirectURL) goto(redirectURL, true);
          loginEvent(user);
        }
      } else if (!error && session.user && sessionid === session.user.sessionid) session.logout();

      return { type, user, error };
    });

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

    app.connection.on("connection", 50, async ({ connected }) => {
      if (connected && session.user) await session.login(session.user);
    });

    if (app.connection.connected && session.user) await session.login(session.user);
  });
};
