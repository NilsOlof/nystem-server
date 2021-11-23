module.exports = async (app) => {
  const { fs } = app;
  const type = app.settings.electronType;

  const filter =
    type !== "external"
      ? (path) => path.split("/")[2] !== "component"
      : (path) => path.split("/")[2] === "electron";

  const readAndCopy = async (path, unlink) => {
    const dest = `${app.__dirname}/electron/src/${path}`;

    if (unlink === true) app.fs.unlink(dest);
    else
      app.writeFileChanged(
        dest,
        fs.readFile(`${app.__dirname}/${path}`, "utf8")
      );
  };

  app.on("debugModeFileChange", ({ path, type }) => {
    if (!filter(path)) return;

    readAndCopy(path, type === "unlink");
  });

  await Promise.all(app.filePaths.filter(filter).map(readAndCopy));
};
