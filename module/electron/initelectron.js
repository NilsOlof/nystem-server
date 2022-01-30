const { spawn } = require("child_process");
const fs = require("fs-extra");
const os = require("os");

const runCommand = (commandLine, cwd) =>
  new Promise((resolve) => {
    console.log("Run", commandLine, "at", cwd);
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
    const app = require("../../core/core/init");

    if (app.fs.existsSync(`${app.__dirname}/electron`)) {
      if (process.platform === "win32")
        await fs.remove(`${folderAsUnix}/electron`);
      else await runCommand("rm -r electron", "/");
    }

    console.log("Create electron app");
    await runCommand("npx create-electron-app electro", "/");
    await fs.rename(`${folderAsUnix}/electro`, `${folderAsUnix}/electron`);

    console.log("Init done, copying");

    await fs.copy(
      `${folderAsUnix}/core/file/eslint.json`,
      `${folderAsUnix}/electron/.eslintrc`
    );

    const copyFolder = (folder) =>
      app.fs.copy(
        `${folderAsUnix}/${folder}`,
        `${folderAsUnix}/electron/src/${folder}`,
        { dereference: true }
      );

    if (app.settings.electronType !== "external") {
      await copyFolder("data");
      await copyFolder("module");
      await copyFolder("core");
      await copyFolder("files");

      console.log("Copy done, creating package.js");
      require("../../core/core/package")(app);
      require("./package")(app);

      const modSettings =
        app.settings.electronType === "hostless"
          ? {
              ...app.settings,
              debug: false,
              port: undefined,
              client: { ...app.settings.client, domain: undefined },
            }
          : { ...app.settings, debug: false };

      app.writeFileChanged(
        `${app.__dirname}/electron/src/data/host.json`,
        JSON.stringify(modSettings, null, "  ")
      );

      console.log("Running npm install");

      await runCommand("npm install", "/electron");
    }

    console.log("Init done");
  } catch (e) {
    console.log("Error", e);
  }
};

webinit();

// rmdir /q/s electron
