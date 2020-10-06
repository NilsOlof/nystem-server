const role = "super";

const start = function (app) {
  const runProgram = function (path, program) {
    const { spawn } = require("child_process");

    const execService = spawn("node", [`${path}/${program}`], {
      cwd: path,
      detached: false,
    });

    console.log(`start ${path}/${program} pid:${execService.pid}`);

    const evHandler = app.addeventhandler();

    execService.stdout.on("data", (data) => {
      data = data.toString();
      evHandler.event("data", { data });
    });

    execService.stderr.on("data", (data) => {
      data = data.toString();
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

  const logs = {};

  const startServer = async (id) => {
    logs[id] = logs[id] || "";
    let running = true;

    const update = async (updatedData) => {
      const { data } = await app.database.serverStatus.get({ id, role });

      app.database.serverStatus.save({
        data: { ...data, ...updatedData },
        role,
      });
    };

    const { data: server } = await app.database.server.get({ id, role });

    const { runbasepath: path } = await app.event("serverPath", server);

    const hasAppJs = await app.fs.exists(`${path}/app.js`);

    const service = runProgram(path, hasAppJs ? "app.js" : "server.js");
    service.on("data", (query) => {
      app.connection.broadcast({
        type: `serverLog${id}`,
        ...query,
      });

      logs[id] += query.data;
      if (logs[id].length > 2000)
        logs[id] = logs[id].substring(logs[id].length - 2000);

      update({ log: logs[id] });
    });

    service.on("exit", async (query) => {
      running = false;
      update({ running, ...query });
    });

    const event = ({ id: inId, data, oldData }) => {
      if (inId !== id || data.running) return;

      if (running) service.event("stop");

      app.database.serverStatus.off("save", event);
    };

    app.database.serverStatus.on("save", event);
  };

  app.database.serverStatus.on("save", (query) => {
    const { data } = query;
    let { oldData } = query;
    oldData = oldData || {};
    const { _id, running } = data;

    if (running && !oldData.running) startServer(_id);
  });
};

module.exports = (app) => {
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

    return { ...server, basepath: path, runbasepath: path };
  });

  app.on("start", start);
};
