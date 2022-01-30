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

const app = {
  fs,
  __dirname:
    process.env.NODE__DIRNAME ||
    __dirname.replace(/\\/g, "/").replace("/core/core", ""),
  pathFinder,
};
app.__dirname = app.__dirname.replace(/\\/g, "/");
app.addeventhandler = require("./client/eventhandler");

app.addeventhandler(app);

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

app.filePaths = pathFinder(app.__dirname);

try {
  // eslint-disable-next-line no-multi-assign
  app.atHost = app.settings = JSON.parse(
    app.fs.readFileSync(`${app.__dirname}/data/host.json`, "utf8")
  );
} catch (e) {
  // eslint-disable-next-line no-multi-assign
  app.atHost = app.settings = {};
}
app.settings.appName = app.settings.appName || "app";
app.settings.client = app.settings.client || {};

module.exports = app;
