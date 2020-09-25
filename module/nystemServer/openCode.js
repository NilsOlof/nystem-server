module.exports = function (app) {
  const runProgram = function (program, args, path) {
    const { spawn } = require("child_process");
    let hasExit = false;
    const extra = path
      ? {
          cwd: path,
          detached: false,
        }
      : { detached: false };
    const execService = spawn(program, args, extra);
    let onStdOut = false;
    let onStdErr = false;
    let onExit = false;
    execService.stdout.on("data", (data) => {
      if (onStdOut) onStdOut(data);
    });
    execService.stderr.on("data", (data) => {
      if (onStdErr) onStdErr(data);
    });
    execService.on("exit", (code) => {
      if (onExit) onExit(code);
      hasExit = true;
      console.log(`Stopped ${path}/${program}`);
    });
    return {
      stop: function () {
        execService.kill("SIGTERM");
      },
      onStdOut: function (callback) {
        onStdOut = callback;
      },
      onStdErr: function (callback) {
        onStdErr = callback;
      },
      onExit: function (callback) {
        onExit = callback;
      },
    };
  };

  app.connection.on("openInCodeEditor", (data) => {
    app.event("serverPath", data.value).then((server) => {
      console.log("Open code path", server.runServerPath);
      if (process.platform !== "win32") {
        require("child_process").exec(`code ${server.runServerPath}`);
        return;
      }
      const hepp = runProgram(
        "C:/Program Files/Microsoft VS Code/Code.exe",
        ["."],
        server.runServerPath.replace(/\//g, "\\")
      );

      hepp.onStdErr(console.log);
      app.connection.emit(data);
    });
  });

  app.connection.on("openInTerminal", (data) => {
    app.event("serverPath", data.value).then((server) => {
      console.log("Open terminal path", server.serverPath);
      if (process.platform === "win32")
        runProgram(`${__dirname}/openTerm.cmd`, [], server.runServerPath);
      else
        require("child_process").exec(
          `open -a Terminal "${server.runServerPath}"`
        );

      app.connection.emit(data);
    });
  });

  app.connection.on("openInFileExplorer", (data) => {
    app.event("serverPath", data.value).then((server) => {
      console.log(
        "Open explorer path",
        server.runServerPath.replace(/\//g, "\\")
      );
      if (process.platform === "win32")
        runProgram("explorer.exe", [server.runServerPath.replace(/\//g, "\\")]);
      else runProgram("open", ["."], server.runServerPath);

      app.connection.emit(data);
    });
  });

  app.connection.on("openSourcetree", (data) => {
    app.event("serverPath", data.value).then((server) => {
      console.log(
        "Open explorer path",
        server.runServerPath.replace(/\//g, "\\")
      );
      if (process.platform === "win32")
        runProgram(
          "C:/Users/Nisse/AppData/Local/SourceTree/SourceTree.exe",
          ["-f", server.serverPath.replace(/\//g, "\\")],
          server.serverPath
        );
      else runProgram("SourceTree", ["."], server.serverPath);

      app.connection.emit(data);
    });
  });
};
