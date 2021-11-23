module.exports = (app) => {
  const readFile = async (path) => JSON.parse(await app.readFile(path));

  const getPackage = async () => {
    const add = await readFile(`${app.__dirname}/electron/package.json`);
    const { name } = app.settings.client;

    add.name = name.toLowerCase().replace(/ /g, "");
    add.productName = name;
    add.description = app.settings.description || name;
    add.config.forge.makers[0].config.name = name
      .toLowerCase()
      .replace(/ /g, "");

    add.config.forge.packagerConfig = { icon: "src/favicon.ico" };
    return add;
  };

  if (app.settings.electronType === "external") {
    app.on("start", async () => {
      app.packages.generate(
        "package.electron.json",
        `${app.__dirname}/electron`,
        [await getPackage()]
      );
    });

    return;
  }

  app.on("start", async () => {
    const add = getPackage();
    const { dependencies } = await readFile(`${app.__dirname}/package.json`);
    add.dependencies = { ...add.dependencies, ...dependencies };

    app.writeFileChanged(
      `${app.__dirname}/electron/package.js`,
      JSON.stringify(add)
    );
  });
};
