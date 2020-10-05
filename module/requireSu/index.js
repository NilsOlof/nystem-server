const { server } = require("websocket");

const os = require("os").platform();

const log = (error, stdout, stderr) => {
  if (error) console.error(error);
  if (stdout) console.log(stdout);
  if (stderr) console.error(stderr);
};

module.exports = (app) => {
  server(app);
  app.on("requireSu.start", (query) => ({ ...query, settings: app.settings }));

  const command = `node ${__dirname}/worker.js`;

  if (os === "win32") require("node-windows").elevate(command, {}, log);
  else require("child_process").exec(`sudo ${command}`, {}, log);
};
