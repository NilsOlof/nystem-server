module.exports = (app) => {
  const hostname = require("os").platform();
  console.log(`At host ${hostname}`);

  app.on("start", 10, async () => {
    const { data = [] } = await app.database.settings.search({ role: "super" });
    const atHost = {
      ...data.find(
        (setting) => hostname.toLowerCase().indexOf(setting.name) !== -1
      ),
    };

    const { folders = [] } = atHost;
    atHost.folders = folders.reduce(
      (res, folder) => ({ ...res, [folder.id]: folder.path }),
      {}
    );

    app.settings.atHost = {
      ...atHost,
      runbasepath: atHost.runbasepath.replace(/\\/g, "/"),
      basepath: atHost.basepath.replace(/\\/g, "/"),
    };
  });

  app.on("start", async () => {
    await app.event("requireSu.start", { path: `${__dirname}/proxy.js` });

    app.database.server.on(["delete", "save"], async (query) => {
      if (query.oldData) await app.event("router.remove", query.oldData);
    });
    app.database.server.on("save", async (query) => {
      await app.event("router.add", query.data);
    });

    app.database.server
      .search({ role: "super" })
      .then(({ data = [] }) =>
        data.forEach((server) => app.event("router.add", server))
      );
  });
};
