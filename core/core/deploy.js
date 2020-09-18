const { exec, spawn } = require("child_process");
const fs = require("fs-extra");
const os = require("os");

const runCommandExec = (command, cwd) =>
  new Promise((resolve, reject) =>
    exec(command, { cwd: cwd ? folder + cwd : null }, (error, stdout, stderr) =>
      error ? reject(error) : resolve(stdout + stderr)
    )
  );

const runCommand = (commandLine, cwd) =>
  new Promise((resolve, reject) => {
    let [command, ...args] = commandLine.split(" ");
    if (os.platform() === "win32" && command === "npm") command = "npm.cmd";

    const opts = {
      cwd: cwd ? folder + cwd : null,
      stdio: [process.stdin, process.stdout, process.stderr],
      detached: false,
    };

    const proc = spawn(command, args, opts);
    proc.on("exit", resolve);
  });

const runGitCommand = (command) =>
  runCommandExec(
    `git --git-dir="${gitFolder}.git" --work-tree="${gitFolder}" ${command}`
  );

const dirname = process.env.NODE__DIRNAME || __dirname;
const folder = dirname.replace(/\\/g, "/");
const folderAsUnix = folder.replace(/\//g, "\\");

let gitFolder = __dirname.replace(/\\/g, "/");
gitFolder = `${gitFolder.substring(0, gitFolder.lastIndexOf("/core/core"))}/`;

const saveContentTypes = () => {
  function file2Type(file, depthLimit, filename, parent) {
    if (fs.statSync(file).isDirectory()) {
      if (!depthLimit) return;
      const files = fs.readdirSync(file);
      for (let i = 0; i < files.length; i++)
        file2Type(`${file}/${files[i]}`, depthLimit - 1, files[i], filename);
    } else if (
      parent === "contentType" &&
      file.indexOf(".json") !== -1 &&
      file.indexOf("component/contentType/definition.json") === -1
    ) {
      try {
        out[filename.replace(".json", "")] = JSON.parse(
          fs.readFileSync(file, "utf8")
        );
      } catch (e) {
        console.log("Parse error", file);
      }
    }
  }

  const out = {};

  file2Type(`${dirname}/core`, 3);
  file2Type(`${dirname}/module`, 3);

  if (!fs.existsSync(`${dirname}/web`)) return;
  fs.writeFile(`${dirname}/web/src/contentype.json`, JSON.stringify(out));
};

const deploy = async () => {
  try {
    saveContentTypes();

    const msg = await runGitCommand("status", gitFolder.replace(/\//g, "\\"));
    if (msg.indexOf("clean") === -1) {
      console.log("Repo not clean", msg);
      return;
    }

    await runGitCommand("checkout master");
    await runGitCommand("merge develop");
    console.log("Merge done, building");

    await runCommand("npm run build:css:prod", "/web");
    await runCommand("npm run build", "/web");
    console.log("Build done, copying");

    const items = await fs.readdir(`${folderAsUnix}/web/build`);
    await Promise.all(
      items.map((item) =>
        fs.copy(
          `${folderAsUnix}/web/build/${item}`,
          `${folderAsUnix}/build/${item}`
        )
      )
    );
    await fs.copy(
      `${folderAsUnix}/web/src/contentype.json`,
      `${folderAsUnix}/build/contentype.json`
    );

    console.log("Copy done, adding to git");
    await runGitCommand("add *");
    await runGitCommand("commit -m Build");
    // await runGitCommand("push");

    await runGitCommand("checkout develop");
    await runCommand("npm run build:css", "/web");
    console.log("Deploy done");
  } catch (e) {
    console.log("Error", e);
  }
};

deploy();
