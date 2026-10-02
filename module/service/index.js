import { spawn } from "node:child_process";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { homedir } from "node:os";
import { setTimeout as delay } from "node:timers/promises";
import { resolveProjectPath, findServerByPath } from "./projectPath.js";

const role = "super";
const maxLogLength = 100000;
const apiKeyPath = `${homedir()}/.codex/nystem-server-control.key`;

const insertValues = (text, data) =>
  text.replace(/{([a-z0-9_\.]+)}/gi, (str, p1) => {
    return data[p1] ? data[p1] : `{${p1}}`;
  });

const resolveExistingPath = (app, path) => {
  path = resolveProjectPath(app.fs, path);
  if (app.fs.existsSync(path)) return path;

  const home = process.env.HOME;
  const homeMatch = path.match(/^\/Users\/[^/]+(\/.*)$/);
  if (!home || !homeMatch) return path;

  const homePath = `${home}${homeMatch[1]}`;
  return app.fs.existsSync(homePath) ? homePath : path;
};

const start = function (app) {
  app.fs.ensureDirSync(`${homedir()}/.codex`);
  if (!app.fs.existsSync(apiKeyPath))
    app.fs.writeFileSync(apiKeyPath, randomBytes(32).toString("hex"), { mode: 0o600 });
  else app.fs.chmodSync(apiKeyPath, 0o600);
  const apiKey = app.fs.readFileSync(apiKeyPath, "utf8").trim();

  const runProgram = function (path, program) {
    const execService = spawn(process.execPath, [`${path}/${program}`], { cwd: path, detached: false });

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
    const runningServer = { restartRequested: false, service: false, stopRequested: false };
    servers.set(id, runningServer);

    try {
      const { data: server } = await app.database.server.get({ id, role });

      const { runbasepath: path, basepath } = await app.event("serverPath", server);

      const update = (updatedData) => {
        return app.database.serverStatus.save({
          data: { _id: id, basepath: path, ...updatedData },
          fields: true,
          role,
        });
      };

      if (runningServer.stopRequested) {
        servers.delete(id);
        await update({ running: false });
        return;
      }

      const service = runProgram(path, "server.js");
      runningServer.service = service;

      const onData = (dataType) => (query) => {
        app.connection.broadcast({ type: `serverLog${id}`, ...query, dataType, path, basepath });

        logs[id] += query.data;
        if (logs[id].length > maxLogLength) logs[id] = logs[id].substring(logs[id].length - maxLogLength);

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
      else update({ running: true, code: null });
    } catch (error) {
      if (servers.get(id) !== runningServer) return;

      servers.delete(id);
      console.log(`Start failed for server ${id}`, error);
      app.database.serverStatus.save({ data: { _id: id, running: false, code: error.code }, fields: true, role });
    }
  };

  app.database.serverStatus.on("save", ({ data, oldData = {} }) => {
    const { _id, running } = data;
    if (running === oldData.running) return;

    setTimeout(() => {
      app.connection.broadcast({ type: "databaseUpdate", contentType: "serverStatus", ids: [_id] });
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

  const restartServer = (serverId) => {
    const runningServer = servers.get(serverId);
    if (!runningServer) {
      startServer(serverId);
      return;
    }

    runningServer.restartRequested = true;
    runningServer.stopRequested = true;
    if (runningServer.service) runningServer.service.event("stop");
  };

  const requestStop = async (serverId) => {
    const runningServer = servers.get(serverId);
    if (runningServer) {
      runningServer.restartRequested = false;
      runningServer.stopRequested = true;
      if (runningServer.service) runningServer.service.event("stop");
    } else {
      await app.database.serverStatus.save({ data: { _id: serverId, running: false }, fields: true, role });
    }
  };

  app.on("serverRestart", ({ serverId }) => restartServer(serverId));

  app.on("serverStop", async ({ serverId }) => {
    await requestStop(serverId);
    for (let attempt = 0; attempt < 300; attempt++) {
      const { data: status } = await app.database.serverStatus.get({ id: serverId, role });
      if (!servers.has(serverId) && status?.running === false) return { stopped: true };
      await delay(100);
    }
    throw new Error("Timed out waiting for the server to stop");
  });

  const sendApiResponse = (id, statusCode, data) => {
    app.file.event("response", {
      id,
      statusCode,
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify(data),
      closed: true,
    });
    return {};
  };

  const authenticateApi = (headers = {}) => {
    const authorization = headers.authorization || "";
    const key = authorization.startsWith("Bearer ") ? authorization.substring(7) : "";
    const suppliedKey = Buffer.from(key);
    const expectedKey = Buffer.from(apiKey);
    return suppliedKey.length === expectedKey.length && timingSafeEqual(suppliedKey, expectedKey);
  };

  const getStatusByPath = async (path) => {
    const { data = [] } = await app.database.serverStatus.search({ role });
    return findServerByPath(app.fs, data, path);
  };

  app.file.on(["get", "post"], 800, async ({ id, url, headers, method }) => {
    if (!url?.startsWith("/codex-api/server")) return;
    if (!authenticateApi(headers)) return sendApiResponse(id, 401, { error: "Unauthorized" });

    const requestUrl = new URL(url, "http://localhost");
    const path = requestUrl.searchParams.get("path");
    if (!path) return sendApiResponse(id, 400, { error: "Missing project path" });

    const status = await getStatusByPath(path);
    if (!status) return sendApiResponse(id, 404, { error: "No unique server found for project path" });

    if (requestUrl.pathname === "/codex-api/server/stop") {
      if (method !== "post") return sendApiResponse(id, 405, { error: "Method not allowed" });
      await requestStop(status._id);
      return sendApiResponse(id, 202, { accepted: true, serverId: status._id, basepath: status.basepath });
    }

    if (requestUrl.pathname === "/codex-api/server/restart") {
      if (method !== "post") return sendApiResponse(id, 405, { error: "Method not allowed" });
      restartServer(status._id);
      return sendApiResponse(id, 202, { accepted: true, serverId: status._id, basepath: status.basepath });
    }

    if (requestUrl.pathname !== "/codex-api/server" || method !== "get")
      return sendApiResponse(id, 404, { error: "Not found" });

    const lineCount = Math.max(1, Math.min(200, Number(requestUrl.searchParams.get("lines")) || 40));
    return sendApiResponse(id, 200, {
      serverId: status._id,
      basepath: status.basepath,
      running: status.running,
      code: status.code,
      log: (status.log || "").split("\n").slice(-lineCount).join("\n"),
    });
  });
};

export default (app) => {
  app.on("serverPath", (server) => {
    const { atHost } = app.settings;
    const hostBasepath = resolveExistingPath(app, atHost.basepath || "");
    const hostRunbasepath = atHost.runbasepath ? resolveExistingPath(app, atHost.runbasepath) : "";

    let basepath = insertValues(server.path, atHost.folders).replace(/\\/g, "/");
    let runbasepath = basepath;

    if (basepath[0] !== "/" && basepath[1] !== ":") {
      basepath = `${hostBasepath}/${basepath}`;
      runbasepath = hostRunbasepath ? `${hostRunbasepath}/${runbasepath}` : basepath;
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

    if (app.fs.existsSync(runbasepath) && !app.fs.lstatSync(runbasepath).isDirectory()) {
      const pathSplit = runbasepath.split("/");
      const len = pathSplit.length;
      runbasepath = pathSplit.slice(0, len - 1).join("/");
    }

    return { ...server, basepath, runbasepath };
  });

  app.on("start", start);
};
