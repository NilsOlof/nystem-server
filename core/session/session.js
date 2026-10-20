/*
 *  Handles logins and sessions for users
 */
export default async (app) => {
  const requestSessions = {};

  app.session = app.addeventhandler({}, ["add", "login", "logout"], "session");

  app.on("init", -100, () => {
    // Load old sessions from disc
    const filePath = `${app.__dirname}/data/db/sessionStore`;
    const storage = app.debounceStorageFile(filePath, {});
    const sessions = storage.get();

    const sessionAllowed = (session, id) => !session.autologinIp || session.autologinIp === app.connection.ip?.(id);

    const getKeys = (expr, store) =>
      Object.entries(store)
        .filter(([, value]) => expr(value))
        .map(([key]) => key);

    // Failed logins per client IP, refused after maxFailures within failureWindow
    const maxFailures = app.settings.loginMaxFailures || 10;
    const failureWindow = 1000 * 60 * 15;
    const failures = {};
    setInterval(() => {
      const limit = Date.now() - failureWindow;
      Object.keys(failures).forEach((key) => {
        failures[key] = failures[key].filter((time) => time > limit);
        if (!failures[key].length) delete failures[key];
      });
    }, failureWindow);

    app.connection.on("login", async (query) => {
      delete query.user;

      if (query.sessionid) {
        if (sessions[query.sessionid] && sessionAllowed(sessions[query.sessionid], query.id)) {
          query.user = sessions[query.sessionid];
          requestSessions[query.id] = query.user;
        }

        return query;
      }

      const failureKey = app.connection.ip?.(query.id) || query.id;
      const recent = (failures[failureKey] || []).filter((time) => time > Date.now() - failureWindow);
      if (recent.length >= maxFailures) {
        console.log(`Login blocked for ${failureKey}, too many attempts`);
        return { ...query, data: false, error: "toomany" };
      }

      const data = query.data || {};
      let contentType = app.database[data.contentType]?.checkPassword ? data.contentType : "adminUser";
      const login = async () => {
        const { error, user } = await app.database[contentType].event("checkPassword", data);
        query.user = user;

        if (error === "missing" && contentType !== "adminUser") {
          contentType = "adminUser";
          return login();
        }

        if (!error) return app.session.login({ ...query, contentType });

        // Same answer for unknown user and wrong password, so logins can't be probed
        failures[failureKey] = [...recent, Date.now()];
        await app.delay(500);
        query.data = false;
        query.error = "password";
        return query;
      };
      return login();
    });

    const logout = (data) => {
      const { sessionid } = requestSessions[data.id] || {};
      delete sessions[sessionid];
      storage.save(sessions);
      delete requestSessions[data.id];

      getKeys((val) => val.sessionid === sessionid, requestSessions).forEach((key) => {
        app.connection.emit({ id: key, type: "logout" });
        delete requestSessions[key];
      });
    };

    app.connection.on("logout", logout);

    app.session.on("logout", ({ _id: id, ...data }) => {
      if (id) {
        getKeys((val) => val._id === id, sessions).forEach((key) => {
          delete sessions[key];
          storage.save(sessions);
        });

        getKeys((val) => val._id === id, requestSessions).forEach((key) => {
          app.connection.emit({ id: key, type: "logout" });
          delete requestSessions[key];
        });
      } else logout(data);
    });

    app.connection.on("disconnect", (data) => {
      if (requestSessions[data.id]) delete requestSessions[data.id];
    });

    app.session.on("add", (data) => {
      delete data.session;
      if (requestSessions[data.id]) data.session = requestSessions[data.id];
      else if (sessions[data.sessionid] && sessionAllowed(sessions[data.sessionid], data.id)) {
        data.session = sessions[data.sessionid];
        if (!requestSessions[data.id]) requestSessions[data.id] = data.session;
      }

      if (data.session) data.role = data.session.role;
    });

    app.session.on("login", async (query) => {
      const { user, type, id, clearOld = false } = query;
      if (!user) return;

      user.sessionid = user.sessionid || app.uuid();
      query.sessionid = user.sessionid;
      query.type = type;

      if (clearOld) await app.session.logout(user);

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
      requestSessions[id] = query.user;
    });

    // Autologin as a user from certain IP addresses, settings: autologin: { IP: [...], user: "<login>" }
    // The session is bound to that IP and is refused from anywhere else
    const { autologin } = app.settings;
    if (autologin?.user && autologin.IP?.length)
      app.connection.on("connect", async ({ id }) => {
        const ip = app.connection.ip?.(id);
        if (!ip || !autologin.IP.includes(ip) || requestSessions[id]) return;

        const { data: user } = await app.database.adminUser.find({
          field: "login",
          value: autologin.user,
          role: "super",
        });
        if (!user) {
          console.log(`Autologin user ${autologin.user} not found`);
          return;
        }

        let session = Object.values(sessions).find((item) => item._id === user._id && item.autologinIp === ip);
        if (!session) {
          ({ user: session } = await app.session.login({ id, user: { ...user }, contentType: "adminUser" }));
          session.autologinIp = ip;
          storage.save(sessions);
          console.log(`Autologin ${autologin.user} from ${ip}`);
        }
        requestSessions[id] = session;
        app.connection.emit({ type: "login", id, user: session });
      });

    const sessionTimeout = 1000 * 60 * 60 * 24 * (app.settings.sessionTimeout || 60);
    if (app.settings.sessionTimeout !== -1)
      setInterval(
        () => {
          const limit = Date.now() - sessionTimeout;

          getKeys((val) => val._crdate < limit, sessions).forEach((key) => {
            delete sessions[key];
            storage.save(sessions);
          });
        },
        1000 * 60 * 5,
      );
  });
};
