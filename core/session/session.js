/*
 *  Handles logins and sessions for users
 */
module.exports = function (app) {
  const requestSessions = {};
  let sessions = {};

  app.session = app.addeventhandler({}, ["add", "login", "logout"], "session");

  // Load old sessions from disc
  const filePath = `${app.__dirname}/data/db/sessionStore.json`;
  if (app.fs.existsSync(filePath))
    sessions = JSON.parse(app.fs.readFileSync(filePath));

  const saveDB = () => app.writeFileChanged(filePath, JSON.stringify(sessions));

  app.connection.on("login", (query) => {
    if (query.sessionid) {
      if (sessions[query.sessionid]) {
        query.user = sessions[query.sessionid];
        requestSessions[query.id] = query.user;
      }
      app.connection.emit(query);
      return;
    }

    let contentType = query.contentType ? query.contentType : "adminUser";
    function login(lastError) {
      app.database[contentType]
        .event("checkPassword", query.data)
        .then(({ error, user }) => {
          if (error === "missing" && contentType !== "adminUser") {
            contentType = "adminUser";
            login(error);
            return;
          }
          if (!error) {
            user = {
              role: user.role,
              _id: user._id,
              sessionid: app.uuid(),
              contentType,
              _crdate: Date.now(),
            };
            console.log(`New session ${user.sessionid}`);
            requestSessions[query.id] = user;
            sessions[user.sessionid] = user;
            saveDB();
            query.user = user;

            app.connection.emit(query);
          } else {
            query.data = false;
            query.error = lastError === "password" ? lastError : error;
            app.connection.emit(query);
          }
        });
    }
    login();
  });

  const logout = (data) => {
    delete sessions[requestSessions[data.id].sessionid];
    saveDB();
    delete requestSessions[data.id];
    app.connection.emit(data);
  };

  app.connection.on("logout", logout);

  const getKeys = (expr, store) =>
    Object.entries(store)
      .filter(([, value]) => expr(value))
      .map(([key]) => key);

  app.session.on("logout", ({ _id: id, ...data }) => {
    if (id) {
      getKeys((val) => val._id === id, sessions).forEach((key) => {
        delete sessions[key];
        saveDB();
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

  app.session.on("login", (query) => {
    const { user, type, id } = query;
    user.sessionid = user.sessionid || app.uuid();
    requestSessions[id] = user;
    query.type = type || "autologin";

    app.connection.emit({ ...query, request: undefined });
  });

  // Autologin as user from certain IP addresses
  app.connection.on("connect", (data) => {
    if (!app.settings.autologin) return;

    const req = data.request;
    let ip = req.remoteAddress;
    if (ip === "127.0.0.1" && req.httpRequest.headers["x-forwarded-for"])
      ip = req.httpRequest.headers["x-forwarded-for"];
    if (!ip || app.settings.autologin.IP.indexOf(ip) === -1) return;

    app.database.adminUser
      .find({ field: "login", value: app.atHost.autologin.user })
      .then(({ user: data }) => app.session.login({ id: data.id, user }));
  });

  const sessionTimeout =
    1000 * 60 * 60 * 24 * (app.settings.sessionTimeout || 60);
  if (app.settings.sessionTimeout !== -1)
    setInterval(() => {
      const limit = Date.now() - sessionTimeout;

      getKeys((val) => val._crdate < limit, sessions).forEach((key) => {
        delete sessions[key];
        saveDB();
      });
    }, 1000 * 60 * 5);
};
