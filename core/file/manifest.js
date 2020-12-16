module.exports = function (app) {
  const { fs } = app;

  function generate(filename, destination) {
    if (!fs.existsSync(destination)) return;

    const packages = app.filePaths
      .filter((path) => {
        const [, , folder, file] = path.split("/");
        return folder === "html" && file === filename;
      })
      .map((path) => app.readFile(`${app.__dirname}/${path}`));

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
        destination,
        JSON.stringify(packagejson, null, "  ")
      );
    });
  }

  generate("manifest.json", `${app.__dirname}/web/public/manifest.json`);
};
