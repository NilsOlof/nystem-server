module.exports = function (app) {
  const { fs } = app;

  function generate(filename, destination, packages) {
    if (!fs.existsSync(destination)) return;

    packages = packages || [];

    app.filePaths
      .filter((path) => {
        const pathpart = path.split("/");
        return pathpart.length === 3 && pathpart[2] === filename;
      })
      .forEach((path) =>
        packages.push(app.readFile(`${app.__dirname}/${path}`))
      );

    return Promise.all(packages).then((packages) => {
      const packagejson = packages
        .map((data) => JSON.parse(data))
        .reduce((prev, data) => {
          if (!prev) return data;
          Object.keys(data).forEach((key) => {
            prev[key] =
              prev[key] && typeof data[key] !== "string"
                ? Object.assign(data[key], prev[key])
                : data[key];
          });
          return prev;
        }, false);

      app.writeFileChanged(
        `${destination}/package.json`,
        JSON.stringify(packagejson, null, "  ")
      );
    });
  }

  const basePackage = generate("package.json", app.__dirname);

  if (fs.existsSync(`${app.__dirname}/web`))
    generate("package.web.json", `${app.__dirname}/web`, [
      app.readFile(`${app.__dirname}/web/package.json`),
    ]);

  app.packages = { generate };
  return basePackage;
};
