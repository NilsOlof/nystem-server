const { spawn } = require("child_process");

const role = "super";

const start = (app) => {
  const runProgram = function (program, args, path = "") {
    const extra = path ? { cwd: path } : {};
    const execService = spawn(program, args, {
      ...extra,
      detached: false,
      env: { ...process.env, NODE_PATH: undefined, NODE__DIRNAME: undefined },
    });

    console.log(`start ${path}/${program} pid:${execService.pid}`, args);

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
      execService.kill("SIGINT");
      console.log(`Kill ${path}/${program}`);
    });

    return evHandler;
  };

  const programRunner = ({ field, callWin, call }) => {
    const start = async (id) => {
      const { data: server } = await app.database.server.get({ id, role });
      const paths = { ...server, ...(await app.event("serverPath", server)) };

      const ev =
        process.platform !== "win32" ? await call(paths) : await callWin(paths);

      if (!ev) return;

      ev.on("data", ({ data }) => console.log(data));

      const stopped = async ({ data, oldData = {} }) => {
        if (data._id === id && !data[field] && oldData[field]) {
          ev.event("stop");
          app.database.serverStatus.off("save", stopped);
        }
      };

      ev.on("exit", async () => {
        console.log(`Stop ${field}`);
        const { data } = await app.database.serverStatus.get({ id, role });
        await app.database.serverStatus.save({
          data: { ...data, [field]: false },
          role,
        });
        await app.database.serverStatus.save({
          data: { ...data, [field]: false },
          role,
        });
      });

      app.database.serverStatus.on("save", stopped);
    };

    app.database.serverStatus.on("save", async ({ id, data, oldData = {} }) => {
      if (data[field] && !oldData[field]) start(id);
    });
  };

  programRunner({
    field: "vscode",
    call: ({ runbasepath }) => {
      console.log("Open code path", runbasepath);
      require("child_process").exec(`code ${runbasepath}`);
    },
    callWin: ({ runbasepath }) => {
      console.log("Open code path", runbasepath);

      return runProgram(
        "C:/Program Files/Microsoft VS Code/Code.exe",
        ["."],
        runbasepath.replace(/\//g, "\\")
      );
    },
  });

  programRunner({
    field: "term",
    call: ({ runbasepath }) => {
      console.log("Open terminal path", runbasepath);
      require("child_process").exec(`open -a Terminal "${runbasepath}"`);
    },
    callWin: ({ runbasepath }) => {
      console.log("Open terminal path", runbasepath);
      return runProgram(`${__dirname}/openTerm.cmd`, [], runbasepath);
    },
  });

  programRunner({
    field: "filexplorer",
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
    field: "sourcetree",
    call: ({ basepath }) => {
      console.log("Open sourcetree", basepath.replace(/\//g, "\\"));
      return runProgram("SourceTree", ["."], basepath);
    },
    callWin: ({ basepath }) => {
      console.log("Open sourcetree", basepath.replace(/\//g, "\\"));
      return runProgram(
        "C:/Users/Nisse/AppData/Local/SourceTree/SourceTree.exe",
        ["-f", basepath.replace(/\//g, "\\")],
        basepath
      );
    },
  });

  programRunner({
    field: "manager",
    call: async ({ basepath, runbasepath, port }) => {
      console.log("Open manager", runbasepath.replace(/\//g, "\\"));

      const { runbasepath: cmdPath } = await app.event("serverPath", {
        path: "{localdeploy}nystemmanager",
      });

      return runProgram("open", [
        app.settings.nystemmanagerpathMac,
        "--args",
        runbasepath,
        runbasepath,
      ]);
      /*
      return runProgram(
        "node",
        ["app.js", "server.js", basepath, port, runbasepath],
        cmdPath
      );
      */
    },
    callWin: async ({ runbasepath }) => {
      console.log("Open manager", runbasepath.replace(/\//g, "\\"));

      return runProgram(app.settings.nystemmanagerpath, [
        runbasepath,
        runbasepath,
      ]);
    },
  });

  app.event("favicon", { file: "/files/image/original/logo2.svg" });
};

module.exports = (app) => app.on("start", start);
