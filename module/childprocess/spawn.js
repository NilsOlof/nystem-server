const { spawn } = require("child_process");

module.exports = (options) => {
  const execService = spawn(
    options.program,
    options.args,
    options.path
      ? {
          cwd: options.path,
          detached: false,
        }
      : { detached: false }
  );

  if (options.onData) execService.stdout.on("data", options.onData);

  execService.stderr.on("data", (data) => {
    console.log("stderr", data.toString());
  });
  if (options.onError) execService.stderr.on("data", options.onError);
  if (options.onExit) execService.on("exit", options.onExit);

  return {
    stop: execService.kill,
    send: function (data) {
      execService.stdin.write(`${data}\r\n`);
    },
    onData: function (callback) {
      execService.stdout.on("data", callback);
    },
  };
};
