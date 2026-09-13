import { exec, spawn } from "node:child_process";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const role = "super";

const start = async (app) => {
  const programs = {};

  const runProgram = function (program, args, path = "") {
    const extra = path ? { cwd: path } : {};
    const execService = spawn(program, args, {
      ...extra,
      detached: false,
      env: { ...process.env, NODE_PATH: undefined, NODE__DIRNAME: undefined },
    });

    console.log(`start ${path}/${program} pid:${execService.pid}`, args);

    const evHandler = app.addeventhandler();

    let exited = false;
    const exit = (query) => {
      if (exited) return;
      exited = true;
      evHandler.event("exit", query);
      app.off("exit", killApp);
    };

    execService.stdout.on("data", (data) => {
      data = data.toString();
      evHandler.event("data", { data });
    });

    execService.stderr.on("data", (data) => {
      data = data.toString();
      evHandler.event("data", { type: "error", data });
    });

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
      execService.kill("SIGINT");
    });

    const killApp = () => {
      execService.kill("SIGTERM");
      console.log(`Kill ${path}/${program}`);
    };
    app.on("exit", killApp);
    return evHandler;
  };

  const programRunner = ({ name, callWin, call }) => {
    programs[name] = async (id) => {
      const { data: server } = await app.database.server.get({ id, role });
      const paths = { ...server, ...(await app.event("serverPath", server)) };

      const ev = process.platform !== "win32" ? await call(paths) : await callWin(paths);

      if (ev) ev.on("data", ({ data }) => console.log(data));
    };
  };

  const { data: servers = [] } = await app.database.server.search({ role });
  await Promise.all(
    servers.map(async (server) => {
      const { runbasepath } = await app.event("serverPath", server);
      return app.database.serverStatus.save({ data: { _id: server._id, basepath: runbasepath }, fields: true, role });
    }),
  );

  programRunner({
    name: "vscode",
    call: ({ runbasepath }) => {
      console.log("Open code path", runbasepath);
      exec(`code ${runbasepath}`);
    },
    callWin: ({ runbasepath }) => {
      console.log("Open code path", runbasepath);

      return runProgram("C:/Program Files/Microsoft VS Code/Code.exe", ["."], runbasepath.replace(/\//g, "\\"));
    },
  });

  programRunner({
    name: "term",
    call: ({ name, runbasepath }) => {
      console.log("Open terminal path", runbasepath);
      const cmux = "/Applications/cmux.app/Contents/Resources/bin/cmux";

      if (process.env.CMUX_SOCKET_PATH && app.fs.existsSync(cmux))
        spawn(cmux, ["workspace", "create", "--focus", "true", "--name", `${name} - terminal`, "--cwd", runbasepath], {
          detached: true,
          stdio: "ignore",
        })
          .on("exit", (code) => {
            if (code === 0) spawn("open", ["-a", "cmux"], { detached: true, stdio: "ignore" }).unref();
          })
          .unref();
      else exec(`open -a Terminal "${runbasepath}"`);
    },
    callWin: ({ runbasepath }) => {
      console.log("Open terminal path", runbasepath);
      return runProgram(`${__dirname}/openTerm.cmd`, [], runbasepath);
    },
  });

  programRunner({
    name: "fileExplorer",
    call: ({ runbasepath }) => {
      console.log("Open explorer path", runbasepath);
      return runProgram("open", ["."], runbasepath);
    },
    callWin: ({ runbasepath }) => {
      console.log("Open explorer path", runbasepath);
      return runProgram("explorer.exe", [runbasepath.replace(/\//g, "\\")]);
    },
  });

  programRunner({
    name: "codex",
    call: ({ runbasepath }) => {
      console.log("Open codex path", runbasepath);
      const codexPath = "/Applications/Codex.app/Contents/Resources/codex";
      return runProgram(app.fs.existsSync(codexPath) ? codexPath : "codex", ["app", runbasepath]);
    },
    callWin: ({ runbasepath }) => {
      console.log("Open codex path", runbasepath);
      return runProgram("cmd.exe", [
        "/c",
        "start",
        "cmd.exe",
        "/k",
        `cd /d "${runbasepath.replace(/\//g, "\\")}" && codex`,
      ]);
    },
  });

  programRunner({
    name: "sourcetree",
    call: ({ basepath }) => {
      console.log("Open sourcetree", basepath.replace(/\//g, "\\"));
      return runProgram("open", ["-a", "Sourcetree", "."], basepath);
    },
    callWin: ({ basepath }) => {
      console.log("Open sourcetree", basepath.replace(/\//g, "\\"));
      return runProgram(
        "C:/Users/Nisse/AppData/Local/SourceTree/SourceTree.exe",
        ["-f", basepath.replace(/\//g, "\\")],
        basepath,
      );
    },
  });

  app.connection.on("serverProgram", async (query) => {
    await app.session.add(query);
    if (query.session?.role !== role || !query.serverId || !programs[query.program]) return;

    await programs[query.program](query.serverId);
    return query;
  });

  app.event("favicon", { file: "/files/image/original/logo2.svg" });
  app.on("extensionContent", async () => ({ content: await app.fs.readFile(`${__dirname}/content.js`) }));

  app.connection.on("devtoolsnystvscode", async ({ path, server }) => {
    if (server) {
      const { data } = await app.database.server.get({ id: server, role: "super" });

      const { runbasepath } = await app.event("serverPath", data);
      path = `${runbasepath}/${path}`;
    }
    console.log("Open code path", path);

    if (process.platform !== "win32") exec(`code -g ${path}`);
    else runProgram("C:/Program Files/Microsoft VS Code/Code.exe", ["-g", path.replace(/\//g, "\\")]);
  });
};

export default (app) => app.on("start", start);
