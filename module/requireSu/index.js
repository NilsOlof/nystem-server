const os = require("os").platform();
const { server } = require("./connection");

const log = (error, stdout, stderr) => {
  if (error) console.error(error);
  if (stdout) console.log(stdout);
  if (stderr) console.error(stderr);
};

const start = (app) => {
  server(app);

  let startCallback = false;
  app.on("requireSu.worker.started", () => {
    if (startCallback) startCallback();
    else startCallback = true;
  });

  app.on("log", ({ log }) => {
    console.log("Worker", log);
  });
  app.on("requireSu.start", (query) => ({ ...query, settings: app.settings }));

  const command = `node ${app.__dirname}/app.js ${__dirname}/worker.js`;

  if (os === "win32") require("node-windows").elevate(command, {}, log);
  else require("child_process").exec(`sudo ${command}`, {}, log);

  if (!startCallback)
    return new Promise((resolve) => {
      startCallback = resolve;
    });
};

module.exports = (app) => app.on("init", start);
