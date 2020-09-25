const start = function (app) {
  app.on("serverPath", (server) => {
    const { atHost } = app.settings;

    let path = app.utils
      .insertValues(server.path, atHost.folders)
      .replace(/\\/g, "/");

    if (path[0] !== "/" && path[1] !== ":") path = `${atHost.basepath}/${path}`;

    if (app.fs.existsSync(path) && !app.fs.lstatSync(path).isDirectory()) {
      const pathSplit = path.split("/");
      const len = pathSplit.length;
      path = pathSplit.slice(0, len - 1).join("/");
    }

    return { basepath: path, runbasepath: path };
  });

  const runProgram = function (path, program) {
    const { spawn } = require("child_process");

    const execService = spawn("node", [`${path}/${program}`], {
      cwd: path,
      detached: false,
    });

    console.log(`start ${path}/${program} pid:${execService.pid}`);

    const evHandler = app.addEventHandler();

    execService.stdout.on("data", (data) => {
      evHandler.event("data", { data });
    });

    execService.stderr.on("data", (data) => {
      evHandler.event("data", { type: "error", data });
    });

    execService.on("exit", (code) => {
      evHandler.event("exit", { code });
      console.log(`Stopped ${path}/${program}`);
    });

    evHandler.on("stop", () => {
      execService.kill("SIGINT");
    });

    app.on("exit", () => {
      execService.kill("SIGTERM");
      console.log(`Kill ${path}/${program}`);
    });

    return evHandler;
  };

  const servers = {};

  const startServer = async (id) => {
    let log = "";

    const update = async (updatedData) => {
      const { data } = await app.database.serverStatus.get({ id });

      app.database.serverStatus.save({
        data: { ...data, ...updatedData },
        role: "super",
      });
    };

    const { data: server } = await app.database.server.get({ id });
    const { runbasepath: path } = await app.event("serverPath", server);
    const hasAppJs = await app.fs.exists(`${path}/app.js`);

    const service = runProgram(`${path}/${hasAppJs ? "app" : "server"}.js`);
    service.on("data", (query) => {
      app.connection.broadcast({
        type: `serverLog${id}`,
        ...query,
      });

      log += query.data;
      if (log.length > 2000) log = log.substring(log.length - 2000);
      update({ log });
    });

    service.on("exit", async (query) => {
      servers[id] = undefined;
      update({ running: false, ...query });
    });

    return {
      kill: () => service.event("stop"),
    };
  };

  app.database.serverStatus.on("save", (query) => {
    const { data } = query;
    let { oldData } = query;
    oldData = oldData || {};
    const { _id, running } = data;

    if (running && !oldData.running) servers[_id] = startServer(_id);
    if (!running && oldData.running && servers[_id]) servers[_id].kill();
  });
};

module.exports = (app) => app.on("start", start);
