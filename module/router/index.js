module.exports = (app) => {
  const hostname = require("os").platform();
  console.log(`At host ${hostname}`);

  let atHost = false;

  app.on("start", () => {
    app.database.settings.search({ role: "super" }).then(({ data }) => {
      atHost = data.find(
        (setting) => hostname.toLowerCase().indexOf(setting.name) !== -1
      );

      const { folders = [] } = atHost;
      atHost.folders = folders.reduce(
        (res, folder) => ({ ...res, [folder.id]: folder.path }),
        {}
      );

      app.event("atHostLoaded", atHost);
    });
  });

  app.on("atHost", (data) =>
    atHost
      ? { ...data, atHost }
      : new Promise((resolve) => {
          app.on("atHostLoaded", (atHost) => resolve({ ...data, atHost }));
        })
  );

  const serverPath = (server) => {
    let path = app.utils
      .insertValues(server.path, atHost.folders)
      .replace(/\\/g, "/");

    if (path[0] !== "/" && path[1] !== ":") path = `${atHost.basepath}/${path}`;

    if (app.fs.existsSync(path) && !app.fs.lstatSync(path).isDirectory()) {
      const pathSplit = path.split("/");
      const len = pathSplit.length;
      path = pathSplit.slice(0, len - 1).join("/");
    }

    server.serverPath = path;
    server.runServerPath = path;
  };

  app.on("serverPath", (server) => {
    return atHost
      ? serverPath(server)
      : new Promise((resolve) => {
          app.on("atHostLoaded", () => resolve(serverPath(server)));
        });
  });

  const startRouter = (proxy) => {
    app.on("router.add", ({ host, port, ip }) => {
      proxy.add(host, port, ip);
    });

    app.on("router.remove", ({ host }) => {
      proxy.remove(host);
    });

    app.database.server.on("delete", (query) => {
      app.event("router.remove", query.oldData);
    });

    app.database.server.on("save", (query) => {
      app
        .event("router.remove", query.oldData)
        .then(() => app.event("router.add", query.data));
    });

    app.database.server
      .search({ role: "super" })
      .then(({ value = [] }) =>
        value.forEach((server) => app.event("router.add", server))
      );
  };

  app.on("start", () => {
    startRouter(require("./proxy")(app.settings.routerPort));
  });
};
