// npx create-electron-app@latest electron
const type = "full";

module.exports = (app) => {
  if (!app.fs.existsSync(`${app.__dirname}/electron`)) return;

  app.fs.ensureDirSync(`${app.__dirname}/electron/src/build`);
  app.fs.ensureDirSync(`${app.__dirname}/electron/src/data`);
  app.fs.ensureDirSync(`${app.__dirname}/electron/src/files`);

  const { fs } = app;
  let scripts = [
    "/module/electron/electron/files.js",
    "/module/electron/electron/devserver.js",
  ];

  const readAndCopy = async (path, unlink) => {
    const dest = `${app.__dirname}/electron/src/${path}`;
    if (path.endsWith("/electron/index.js")) scripts.push(path);

    if (unlink === true) app.fs.unlink(dest);
    else
      app.writeFileChanged(
        dest,
        fs.readFile(`${app.__dirname}/${path}`, "utf8")
      );
  };

  const filter =
    type === "full"
      ? (path) => path.split("/")[2] !== "component"
      : (path) => path.split("/")[2] === "electron";

  app.on("start", async () => {
    scripts = [];
    await Promise.all(app.filePaths.filter(filter).map(readAndCopy));
    app.writeFileChanged(
      `${app.__dirname}/electron/src/scripts.js`,
      `module.exports = (app) => {\n${scripts.map(
        (path) => `require('./${path}')(app);\n`
      )}}\n`
    );
  });

  app.on("debugModeFileChange", ({ path, type }) => {
    if (!filter(path)) return;

    readAndCopy(path, type === "unlink");
  });

  app.on("start", async () => {
    fs.copy(
      `${app.__dirname}/module/electron/electron/preload.js`,
      `${app.__dirname}/electron/src/preload.js`
    );
    fs.copy(
      `${app.__dirname}/module/electron/electron/core.js`,
      `${app.__dirname}/electron/src/index.js`
    );
  });

  if (type !== "full")
    app.on("start", async () => {
      fs.copy(
        `${app.__dirname}/core/core/client/eventhandler.js`,
        `${app.__dirname}/electron/src/core/core/client/eventhandler.js`
      );
    });

  if (!app.fs.existsSync(`${app.__dirname}/web/build`)) return;

  app.on("start", async () => {
    if (
      (await fs.stat(`${app.__dirname}/web/build`)).mtimeMs <
      (await fs.stat(`${app.__dirname}/electron/src/build`)).mtimeMs
    )
      return;

    fs.copy(
      `${app.__dirname}/web/build`,
      `${app.__dirname}/electron/src/build`
    );
  });

  app.on("favicon", -10, ({ png }) => {
    app.fs.writeFile(`${app.__dirname}/electron/src/icon.png`, png);
  });
};
