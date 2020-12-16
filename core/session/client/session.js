module.exports = function (app) {
  const { userContentType = "adminUser" } = app.settings;
  const sessionKey = `session${userContentType}`;

  app.session = app.addeventhandler({}, ["login", "logout"], "session");
  const { session } = app;
  let autoLoginUser = false;

  function loginEvent(user) {
    if (JSON.stringify(user) === JSON.stringify(session.user)) return;

    try {
      app.storage.setItem({ id: sessionKey, value: user });
      // eslint-disable-next-line no-empty
    } catch (e) {}
    session.user = user;
    if (typeof session.user.role === "string")
      session.user.role = [session.user.role];

    app.event("login", user);
  }

  session.on("login", (value) =>
    app.connection
      .emit({
        type: "login",
        data: value,
        sessionid: value.sessionid,
        contentType: value.contentType,
      })
      .then((query) => {
        const { user } = query;

        if (user && !query.error) loginEvent(user);
        else {
          session.user = autoLoginUser;
          try {
            app.storage.removeItem({ id: sessionKey });
            // eslint-disable-next-line no-empty
          } catch (e) {}
        }
        return query;
      })
  );

  app.connection.on("autologin", (query) => {
    const { user, error } = query;

    if (!user || error) return;
    autoLoginUser = user;
    if (session.user) return;

    session.user = user;
    if (typeof session.user.role === "string")
      session.user.role = [session.user.role];

    app.event("login", user);
  });

  const reload = ({ key, id }) => {
    if ((key || id) !== sessionKey) return;
    window.location.reload();
  };
  window.addEventListener("storage", reload);
  app.storage.on("removeItem", -1000, reload);
  app.storage.on("setItem", -1000, reload);

  session.on("logout", () => {
    app.storage.removeItem({ id: sessionKey });

    delete session.user;

    app.connection.emit({
      type: "logout",
      contentType: userContentType,
      noCallback: true,
    });

    app.event("logout");
  });

  app.connection.on("logout", () => {
    app.storage.removeItem({ id: sessionKey });
  });

  app.on("init", () =>
    app.storage.getItem({ id: sessionKey }).then(({ value: userStore }) => {
      session.user = userStore || autoLoginUser;

      if (userStore) {
        if (app.connection.connected()) session.login(userStore);

        app.connection.on("connect", () => {
          session.login(userStore);
        });
      }
    })
  );
};
