import { spawn } from "node:child_process";

const role = "super";
const maxLogLength = 100000;

const insertValues = (text, data) =>
  text.replace(/{([a-z0-9_\.]+)}/gi, (str, p1) => {
    return data[p1] ? data[p1] : `{${p1}}`;
  });

const resolveExistingPath = (app, path) => {
  if (app.fs.existsSync(path)) return path;

  const home = process.env.HOME;
  const homeMatch = path.match(/^\/Users\/[^/]+(\/.*)$/);
  if (!home || !homeMatch) return path;

  const homePath = `${home}${homeMatch[1]}`;
  return app.fs.existsSync(homePath) ? homePath : path;
};

const start = function (app) {
  const runProgram = function (path, program) {
    const execService = spawn(process.execPath, [`${path}/${program}`], {
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

    let exited = false;
    const exit = (query) => {
      if (exited) return;
      exited = true;
      evHandler.event("exit", query);
      app.off("exit", killApp);
    };

    execService.on("error", (error) => {
      evHandler.event("data", { type: "error", data: `${error}\n` });
      exit({ code: error.code });
      console.log(`Start failed ${path}/${program}`, error);
    });

    execService.on("exit", (code) => {
      exit({ code });
      console.log(`Stopped ${path}/${program}`);
    });

    evHandler.on("stop", () => {
      if (execService.stdin.writable) execService.stdin.write("exit");
      setTimeout(() => execService.kill("SIGINT"), 300);
    });

    const killApp = () => {
      execService.kill("SIGTERM");
      console.log(`Kill ${path}/${program}`);
    };
    app.on("exit", killApp);

    return evHandler;
  };

  const logs = {};
  const servers = new Map();

  const startServer = async (id) => {
    if (servers.has(id)) return;

    logs[id] = logs[id] || "";
    const runningServer = {
      restartRequested: false,
      service: false,
      stopRequested: false,
    };
    servers.set(id, runningServer);

    try {
      const { data: server } = await app.database.server.get({ id, role });

      const { runbasepath: path, basepath } = await app.event(
        "serverPath",
        server,
      );

      const update = async (updatedData) => {
        app.database.serverStatus.save({
          data: { _id: id, basepath: path, ...updatedData },
          fields: true,
          role,
        });
      };

      const hasAppJs = await app.fs.exists(`${path}/app.js`);

      if (runningServer.stopRequested) {
        servers.delete(id);
        return;
      }

      const service = runProgram(path, hasAppJs ? "app.js" : "server.js");
      runningServer.service = service;

      const onData = (dataType) => (query) => {
        app.connection.broadcast({
          type: `serverLog${id}`,
          ...query,
          dataType,
          path,
          basepath,
        });

        logs[id] += query.data;
        if (logs[id].length > maxLogLength)
          logs[id] = logs[id].substring(logs[id].length - maxLogLength);

        update({ log: logs[id] });
      };
      service.on("data", onData("data"));
      service.on("error", onData("error"));

      service.on("exit", async (query) => {
        if (servers.get(id) !== runningServer) return;

        servers.delete(id);
        if (runningServer.restartRequested) startServer(id);
        else update({ running: false, ...query });
      });

      if (runningServer.stopRequested) service.event("stop");
    } catch (error) {
      if (servers.get(id) !== runningServer) return;

      servers.delete(id);
      console.log(`Start failed for server ${id}`, error);
      app.database.serverStatus.save({
        data: { _id: id, running: false, code: error.code },
        fields: true,
        role,
      });
    }
  };

  app.database.serverStatus.on("save", ({ data, oldData = {} }) => {
    const { _id, running } = data;
    if (running === oldData.running) return;

    setTimeout(() => {
      app.connection.broadcast({
        type: "databaseUpdate",
        contentType: "serverStatus",
        ids: [_id],
      });
    });

    const runningServer = servers.get(_id);
    if (running) {
      if (!runningServer) startServer(_id);
      else if (runningServer.stopRequested) {
        runningServer.restartRequested = Boolean(runningServer.service);
        runningServer.stopRequested = false;
      }
      return;
    }

    if (!runningServer) return;

    runningServer.restartRequested = false;
    runningServer.stopRequested = true;
    if (runningServer.service) runningServer.service.event("stop");
  });
};

export default (app) => {
  app.on("serverPath", (server) => {
    const { atHost } = app.settings;
    const hostBasepath = resolveExistingPath(app, atHost.basepath || "");
    const hostRunbasepath = atHost.runbasepath
      ? resolveExistingPath(app, atHost.runbasepath)
      : "";

    let basepath = insertValues(server.path, atHost.folders).replace(/\\/g, "/");
    let runbasepath = basepath;

    if (basepath[0] !== "/" && basepath[1] !== ":") {
      basepath = `${hostBasepath}/${basepath}`;
      runbasepath = hostRunbasepath
        ? `${hostRunbasepath}/${runbasepath}`
        : basepath;
    }

    basepath = resolveExistingPath(app, basepath);

    if (hostRunbasepath && basepath.startsWith(hostBasepath)) {
      runbasepath = basepath.replace(hostBasepath, hostRunbasepath);
    }

    runbasepath = resolveExistingPath(app, runbasepath);

    if (app.fs.existsSync(basepath) && !app.fs.lstatSync(basepath).isDirectory()) {
      const pathSplit = basepath.split("/");
      const len = pathSplit.length;
      basepath = pathSplit.slice(0, len - 1).join("/");
    }

    if (
      app.fs.existsSync(runbasepath) &&
      !app.fs.lstatSync(runbasepath).isDirectory()
    ) {
      const pathSplit = runbasepath.split("/");
      const len = pathSplit.length;
      runbasepath = pathSplit.slice(0, len - 1).join("/");
    }

    return { ...server, basepath, runbasepath };
  });

  app.on("start", start);
};
