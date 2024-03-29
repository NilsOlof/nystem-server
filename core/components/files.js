module.exports = (app) => {
  const { fs } = app;

  const replaceRequire = (content) =>
    content.replace(
      /const ([a-z]+)M = require\(".\/\1"\);$/gim,
      'import $1M from ".$1";'
    );

  const replaceExports = (content) => {
    return content.replace(/module.exports = /gim, "export default ");
  };

  const readAndCopy = (path, unlink) => {
    const dest = `${app.__dirname}/web/src/${path}`;

    if (unlink === true) app.fs.unlink(dest);
    else
      app.writeFileChanged(
        dest,
        fs
          .readFile(`${app.__dirname}/${path}`, "utf8")
          .then(replaceExports)
          .then(replaceRequire)
      );
  };
  app.on("start", () =>
    app.filePaths
      .filter((path) => path.split("/")[2] === "component")
      .forEach(readAndCopy)
  );

  app.on("debugModeFileChange", ({ path, type }) => {
    const pathSplit = path.split("/");
    if (pathSplit[3] !== "component") return;

    readAndCopy(path, type === "unlink");
  });
};
