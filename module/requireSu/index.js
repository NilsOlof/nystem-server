import { spawn } from "node:child_process";
import { platform } from "node:os";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const os = platform();

const log = (error, stdout, stderr) => {
  if (error) console.error(error);
  if (stdout) console.log(stdout);
  if (stderr) console.error(stderr);
};

const start = async (app) => {
  if (app.settings.noRequireSu) return;

  const { server } = await app.require("./connection", true);
  const suServer = server(app);
  app.on("exit", () => suServer.close());

  let startCallback = false;
  app.on("requireSu.worker.started", () => {
    if (startCallback) startCallback();
    else startCallback = true;
  });

  app.on("log2", ({ log }) => {
    console.log("Worker", log);
  });
  app.on("requireSu.start", (query) => ({ ...query, settings: app.settings }));

  const command = `node "${app.__dirname}/app.js" "${__dirname}/worker.js"`;

  if (os === "win32") {
    const sudo = (await import(app.nodePath("sudo-prompt"))).default;
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

    spawn("osascript", args, opt);
  }

  if (!startCallback)
    return new Promise((resolve) => {
      startCallback = resolve;
    });
};

export default (app) => app.on("init", start);
