export default (app) => {
  const { fs } = app;

  const readAndCopy = (path, unlink) => {
    let dest = `${app.__dirname}/web/src/${path}`;
    if (dest.endsWith(".js")) dest = dest.replace(/\.js$/, ".tsx");

    if (unlink === true) app.fs.unlink(dest);
    else
      app.writeFileChanged(
        dest,
        fs.readFile(`${app.__dirname}/${path}`, "utf8"),
      );
  };
  app.on("start", () =>
    app.filePaths
      .filter((path) => path.split("/")[2] === "component")
      .forEach(readAndCopy),
  );

  app.on("debugModeFileChange", ({ path, type }) => {
    const pathSplit = path.split("/");
    if (pathSplit[3] !== "component") return;

    readAndCopy(path, type === "unlink");
  });
};
