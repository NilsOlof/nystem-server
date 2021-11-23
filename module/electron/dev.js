// npx create-electron-app@latest electron
// types: hostless, host, external
// https://stackoverflow.com/questions/39126429/electron-splashscreen-on-startup-application/41486368

module.exports = (app) => {
  const copy = (path, add = "") =>
    fs.copy(
      `${app.__dirname}/${add}${path}`,
      `${app.__dirname}/electron/src/${path}`
    );

  const ensureDir = (path) =>
    app.fs.ensureDirSync(`${app.__dirname}/electron/src/${path}`);

  const type = app.settings.electronType;
  if (!type || !app.fs.existsSync(`${app.__dirname}/electron`)) return;

  ensureDir("data");

  app.fs.ensureDirSync(
    `${app.__dirname}/electron/src/module/electron/electron`
  );

  const { fs } = app;

  require("./icon")(app);
  app.on("start", () => {
    require("./files")(app);
    require("./host")(app);
  });

  if (type === "external") {
    app.on("start", async () => {
      copy("core/core/client/eventhandler.js");

      const scripts = [
        "module/electron/electron/files.js",
        "module/electron/electron/devserver.js",
        "module/electron/electron/menubar.js",
        ...app.filePaths.filter((path) => path.endsWith("/electron/index.js")),
      ];

      app.writeFileChanged(
        `${app.__dirname}/electron/src/scripts.js`,
        `module.exports = (app) => {\n${scripts
          .map((path) => `  require('./${path}')(app);\n`)
          .join("")}};\n`
      );
    });

    return;
  }

  app.on("start", async () => {
    ensureDir("build");
    ensureDir("files");

    if (
      (await fs.stat(`${app.__dirname}/web/build`)).mtimeMs <
      (await fs.stat(`${app.__dirname}/electron/src/build`)).mtimeMs
    )
      return;

    copy(`build`, "web/");
  });
};
