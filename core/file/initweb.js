const { spawn } = require("child_process");
const fs = require("fs-extra");
const os = require("os");

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
    const app = require("../core/init");

    if (app.fs.existsSync(`${app.__dirname}/web`)) runCommand("rmdir /q/s web");

    await runCommand("npx create-react-app web", "/");
    await runCommand("npm install -D tailwindcss postcss autoprefixer", "/web");
    // await runCommand("npx tailwindcss init -p", "/web");

    console.log("Init done, copying");

    await fs.copy(
      `${folderAsUnix}/core/file/eslint.json`,
      `${folderAsUnix}/web/.eslintrc`
    );
    await fs.copy(
      `${folderAsUnix}/core/style/tailwind.config.js`,
      `${folderAsUnix}/web/tailwind.config.js`
    );

    console.log("Copy done, creating package.js");
    require("../core/package")(app);

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
