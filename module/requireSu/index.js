const os = require("os").platform();
const { server } = require("./connection");

const log = (error, stdout, stderr) => {
  if (error) console.error(error);
  if (stdout) console.log(stdout);
  if (stderr) console.error(stderr);
};

const start = (app) => {
  if (app.settings.noRequireSu) return;

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

  const command = `node "${app.__dirname}/app.js" "${__dirname}/worker.js"`;

  if (os === "win32") {
    const sudo = require("sudo-prompt");
    sudo.exec(command, { name: "Router start" }, (error, stdout, stderr) => {
      if (error) throw error;
      console.log(`stdout: ${stdout}`);
    });
  } else {
    const opt = {
      cwd: `${app.__dirname}`,
      env: process.env,
      stdio: [process.stdin, process.stdout, process.stderr],
      detached: false,
    };

    const args = [
      "-e",
      `tell app "Terminal" to activate\ntell app "Terminal" to do script "cd \\"${app.__dirname}\\" && npm run worker && exit"`,
    ];

    require("child_process").spawn("osascript", args, opt);
  }

  if (!startCallback)
    return new Promise((resolve) => {
      startCallback = resolve;
    });
};

module.exports = (app) => app.on("init", start);
