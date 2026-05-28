import path from "path";
import { fileURLToPath } from "url";

let fs = await import("fs");

const nodePath = (name) => {
  const nodePath = process.env.NODE_PATH;
  if (!nodePath) return name;
  console.log(`nodePath ${nodePath}/${name}/package.json`);
  const { main = "index.js" } = JSON.parse(
    fs.readFileSync(`${nodePath}/${name}/package.json`),
  );

  return `file://${process.env.NODE_PATH}/${name}/${main.replace("./", "")}`;
};

try {
  fs = (await import(nodePath("fs-extra"))).default;
} catch (e) {
  fs = await import("fs");
}

const pathFinder = (basePath) => {
  const readPath = (path, paths) => {
    paths = paths || [];
    if (!fs.existsSync(path)) {
      return;
    }
    if (fs.statSync(path).isDirectory()) {
      const files = fs.readdirSync(path);
      for (let i = 0; i < files.length; i++)
        readPath(`${path}/${files[i]}`, paths);
    } else paths.push(path.replace(`${basePath}/`, ""));
    return paths;
  };
  return readPath(`${basePath}/core`).concat(readPath(`${basePath}/module`));
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getCallerFilePath() {
  const stack = new Error().stack.split("\n");

  return stack[3].slice(
    stack[3].lastIndexOf("file://"),
    stack[3].lastIndexOf("/"),
  );
}

const app = {
  fs,
  __dirname:
    process.env.NODE__DIRNAME ||
    __dirname.replace(/\\/g, "/").replace("/core/core", ""),
  pathFinder,
  require: async (path, skip) => {
    if (path[0] === ".") path = path.replace(".", getCallerFilePath());
    else path = `file://${path}`;

    if (!path.endsWith(".js")) path += ".js";
    try {
      const mod = await import(path);
      if (typeof mod.default === "function" && !skip) mod.default(app);
      return mod.default;
    } catch (e) {
      console.log(`require ${path} fail ${e}`);
    }
  },
  nodePath,
};

app.__dirname = app.__dirname.replace(/\\/g, "/");
app.waitInLine = await app.require("./client/waitInLine");

app.writeFileChanged = (fileName, data) =>
  new Promise((resolve, reject) => {
    function save(destdata) {
      Promise.resolve(data).then(async (data) => {
        if (data !== destdata) {
          if (!destdata) await fs.ensureFile(fileName);
          fs.writeFile(fileName, data, (err) => {
            if (err) reject(err);
            else resolve();
          });
        } else resolve();
      });
    }

    if (fs.existsSync(fileName))
      fs.readFile(fileName, "utf8", (err, data) =>
        err ? reject(err) : save(data),
      );
    else save();
  });

app.readFile = (fileName) =>
  new Promise((resolve, reject) => {
    fs.readFile(fileName, "utf8", (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });

app.filePaths = pathFinder(app.__dirname);

try {
  // eslint-disable-next-line no-multi-assign
  app.atHost = app.settings = JSON.parse(
    app.fs.readFileSync(`${app.__dirname}/data/host.json`, "utf8"),
  );
} catch (e) {
  // eslint-disable-next-line no-multi-assign
  app.atHost = app.settings = {};
}

app.addeventhandler = (await app.require("./client/eventhandler"))(
  app.settings.eventTimeOutError,
);
app.addeventhandler(app);
app.settings.appName = app.settings.appName || "app";
app.settings.client = app.settings.client || {};

export default app;
