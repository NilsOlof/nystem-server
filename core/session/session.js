/*
 *  Handles logins and sessions for users
 */
module.exports = function (app) {
  const requestSessions = {};
  let sessions = {};

  app.session = app.addeventhandler({}, ["add", "login"], "session");

  // Load old sessions from disc
  const filePath = `${app.__dirname}/data/db/sessionStore.json`;
  if (app.fs.existsSync(filePath))
    sessions = JSON.parse(app.fs.readFileSync(filePath));

  function saveDB() {
    app.fs.writeFile(filePath, JSON.stringify(sessions));
  }

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
            user = { ...user, sessionid: app.uuid(), contentType };
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
  app.session.on("logout", logout);

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
    const ip = req.remoteAddress;
    if (ip === "127.0.0.1" && req.httpRequest.headers["x-forwarded-for"])
      ip = req.httpRequest.headers["x-forwarded-for"];
    if (!ip || app.settings.autologin.IP.indexOf(ip) === -1) return;

    app.database.adminUser
      .find({ field: "login", value: app.atHost.autologin.user })
      .then(({ user: data }) => app.session.login({ id: data.id, user }));
  });

  app.express.post("/login", (req, res) => {
    res.end("");
  });

  app.express.post("/logut", (req, res) => {
    res.end("");
  });
};
