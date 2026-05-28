import { spawn } from "child_process";
import os from "os";
// import init from "../core/init.js";
// import packageM from "../core/package.js";

let fs = await import("fs");

const nodePath = (name) => {
  const nodePath = process.env.NODE_PATH;
  if (!nodePath) return name;

  const { main } = JSON.parse(
    fs.readFileSync(`${nodePath}/${name}/package.json`),
  );

  return `file://${process.env.NODE_PATH}/${name}/${main.replace("./", "")}`;
};

fs = (await import(nodePath("fs-extra"))).default;

const init = (await import("../core/init.js")).default;
const packageM = (await import("../core/package.js")).default;

const runCommand = (commandLine, cwd) =>
  new Promise((resolve) => {
    console.log("Running ", commandLine, "at", cwd);

    // eslint-disable-next-line prefer-const
    let [command, ...args] = commandLine.split(" ");

    if (os.platform() === "win32" && command === "npm") command = "npm.cmd";
    if (os.platform() === "win32" && command === "npx") command = "npx.cmd";

    const opts = {
      cwd: cwd ? folder + cwd : null,
      stdio: [process.stdin, process.stdout, process.stderr],
      detached: false,
      shell: true,
    };

    const proc = spawn(command, args, opts);
    proc.on("exit", resolve);
  });

const dirname = process.env.NODE__DIRNAME || __dirname;
const folder = dirname.replace(/\\/g, "/");
const folderAsUnix =
  process.platform === "win32" ? folder.replace(/\//g, "\\") : folder;

const webinit = async () => {
  try {
    const app = init;

    if (app.fs.existsSync(`${app.__dirname}/web`)) runCommand("rmdir /q/s web");

    await runCommand(
      "npm create vite@latest web -- --template react --no-interactive",
      "/",
    );

    console.log("Init done, copying");
    await app.writeFileChanged(
      `${folderAsUnix}/web/vite.config.js`,
      fs
        .readFileSync(`${folderAsUnix}/core/file/vite.config.js`, "utf-8")
        .replace(/99999999/g, app.settings.port + 5000),
    );
    await fs.copy(
      `${folderAsUnix}/core/file/eslint.json`,
      `${folderAsUnix}/web/.eslintrc`,
    );
    await fs.copy(
      `${folderAsUnix}/core/style/tailwind.config.js`,
      `${folderAsUnix}/web/tailwind.config.js`,
    );
    await fs.remove(`${folderAsUnix}/web/src/assets`);
    await fs.unlink(`${folderAsUnix}/web/src/main.jsx`);
    await fs.unlink(`${folderAsUnix}/web/src/App.css`);
    console.log("Copy done, creating package.js");
    packageM(app);

    await runCommand("npm install", "/web");

    console.log("");
    console.log("Init web done");
  } catch (e) {
    console.log("Error", e);
  }
};

webinit();

/*
rmdir /q/s web

@tailwind base;
@tailwind components;
@tailwind utilities;
*/
