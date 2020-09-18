module.exports = function () {};

const http = require("http");

let fs;
try {
  fs = require("fs-extra");
} catch (e) {
  fs = require("fs");
  fs.outputFile = fs.writeFile;
}

function pathFinder(basePath) {
  function readPath(path, paths) {
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
  }
  return readPath(`${basePath}/core`).concat(readPath(`${basePath}/module`));
}

let app = {
  fs,
  __dirname: process.env.NODE__DIRNAME || __dirname.replace("/core/core", ""),
  pathFinder,
};

app.writeFileChanged = (fileName, data) =>
  new Promise((resolve, reject) => {
    function save(destdata) {
      Promise.resolve(data).then((data) => {
        if (data !== destdata)
          fs.outputFile(fileName, data, (err) => {
            if (err) reject(err);
            else resolve();
          });
        else resolve();
      });
    }

    if (fs.existsSync(fileName))
      fs.readFile(fileName, "utf8", (err, data) =>
        err ? reject(err) : save(data)
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

process.on("EXIT", () => {
  app.event("exit");
});
process.on("SIGINT", () => {
  process.exit();
});
process.on("SIGTERM", () => {
  process.exit();
});
app.filePaths = pathFinder(app.__dirname);

require("./package.js")(app).then(() => {
  const express = require("express")();
  const server = http.createServer(express);

  express.use((req, res, next) => {
    res.removeHeader("x-powered-by");
    next();
  });

  app = { ...app, server, express };

  process.on("unhandledRejection", (r) => console.log("unhandledRejection", r)); // eslint-disable-line no-console

  console.time("load"); // eslint-disable-line no-console

  app.cacheTimeStart = new Date();

  try {
    // Load server specific settings from /data/host.json
    // eslint-disable-next-line no-multi-assign
    app.atHost = app.settings = JSON.parse(
      fs.readFileSync(`${app.__dirname}/data/host.json`, "utf8")
    );
  } catch (e) {
    // eslint-disable-next-line no-multi-assign
    app.atHost = app.settings = {};
  }
  app.settings.appName = app.settings.appName || "app";
  app.settings.client = app.settings.client || {};

  app.addeventhandler = require("./client/eventhandler");
  app.addeventhandler(app);
  require("./utils.js")(app);

  app.uuid = app.utils.generateGUID;
  const { debug } = app.settings;
  app.filePaths.forEach((path) => {
    const pathpart = path.split("/");
    if (pathpart.length !== 3) return;
    path = `${app.__dirname}/${path}`;

    if (pathpart[2] === "index.js") require(path)(app);

    if (debug && pathpart[2] === "dev.js") require(path)(app);

    if (!debug && pathpart[2] === "prod.js") require(path)(app);
  });

  app
    .event("init")
    .then(() => app.event("load"))
    .then(() => app.event("start"))
    .then(() => {
      console.timeEnd("load"); // eslint-disable-line no-console
      server.listen(app.settings.port, app.settings.host);
    });
});
