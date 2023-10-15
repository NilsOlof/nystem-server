/*
 *  Handles logins and sessions for users
 */
module.exports = (app) => {
  const requestSessions = {};

  app.session = app.addeventhandler({}, ["add", "login", "logout"], "session");

  // Load old sessions from disc
  const filePath = `${app.__dirname}/data/db/sessionStore`;
  const storage = app.debounceStorageFile(filePath, {});
  const sessions = storage.get();

  const getKeys = (expr, store) =>
    Object.entries(store)
      .filter(([, value]) => expr(value))
      .map(([key]) => key);

  app.on("init", -100, () => {
    app.connection.on("login", async (query) => {
      if (query.sessionid) {
        if (sessions[query.sessionid]) {
          query.user = sessions[query.sessionid];
          requestSessions[query.id] = query.user;
        }

        return query;
      }

      let contentType = query.data.contentType
        ? query.data.contentType
        : "adminUser";
      const login = async (lastError) => {
        const { error, user } = await app.database[contentType].event(
          "checkPassword",
          query.data
        );
        query.user = user;

        if (error === "missing" && contentType !== "adminUser") {
          contentType = "adminUser";
          return login(error);
        }

        if (!error) return app.session.login({ ...query, contentType });

        query.data = false;
        query.error = lastError === "password" ? lastError : error;
        return query;
      };
      return login();
    });

    const logout = (data) => {
      delete sessions[requestSessions[data.id]?.sessionid];
      storage.save(sessions);
      delete requestSessions[data.id];
      app.connection.emit(data);
    };

    app.connection.on("logout", logout);

    app.session.on("logout", ({ _id: id, ...data }) => {
      if (id) {
        getKeys((val) => val._id === id, sessions).forEach((key) => {
          delete sessions[key];
          storage.save(sessions);
        });
        getKeys((val) => val._id === id, requestSessions).forEach((key) =>
          logout({ id: key, type: "logout" })
        );
      } else logout(data);
    });

    app.connection.on("disconnect", (data) => {
      if (requestSessions[data.id]) delete requestSessions[data.id];
    });

    app.session.on("add", (data) => {
      if (requestSessions[data.id]) {
        data.session = requestSessions[data.id];
        return;
      }

      if (sessions[data.sessionid]) {
        data.session = sessions[data.sessionid];
        if (!requestSessions[data.id]) requestSessions[data.id] = data.session;
      }
    });

    app.session.on("login", async (query) => {
      const { user, type, id } = query;
      user.sessionid = user.sessionid || app.uuid();
      query.sessionid = user.sessionid;

      query.type = type;
      if (type !== "autologin") {
        query.user = await app.session.event("createSession", {
          role: user.role,
          _id: user._id,
          sessionid: user.sessionid,
          contentType: query.contentType,
          _crdate: Date.now(),
        });

        sessions[user.sessionid] = query.user;
        storage.save(sessions);
        console.log(`New session ${user.sessionid}`);
      }
      requestSessions[id] = query.user;
    });

    // Autologin as user from certain IP addresses
    if (app.settings.autologin)
      app.connection.on("connection", (data) => {
        const req = data.request;
        let ip = req.remoteAddress;
        if (ip === "127.0.0.1" && req.httpRequest.headers["x-forwarded-for"])
          ip = req.httpRequest.headers["x-forwarded-for"];
        if (!ip || app.settings.autologin.IP.indexOf(ip) === -1) return;

        app.database.adminUser
          .find({
            field: "login",
            value: app.atHost.autologin.user,
            role: "super",
          })
          .then(({ data }) =>
            app.session.login({ id: data.id, user: data, type: "autologin" })
          );
      });
  });

  const sessionTimeout =
    1000 * 60 * 60 * 24 * (app.settings.sessionTimeout || 60);
  if (app.settings.sessionTimeout !== -1)
    setInterval(() => {
      const limit = Date.now() - sessionTimeout;

      getKeys((val) => val._crdate < limit, sessions).forEach((key) => {
        delete sessions[key];
        storage.save(sessions);
      });
    }, 1000 * 60 * 5);
};
