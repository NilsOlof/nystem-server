module.exports = async (app) => {
  if (!app.fs.existsSync(`${app.__dirname}/electron`)) return;

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

    add.config.forge.packagerConfig = { icon: "src/icon" };
    return add;
  };

  if (app.settings.electronType === "external") {
    app.packages.generate(
      "package.electron.json",
      `${app.__dirname}/electron`,
      [await getPackage()]
    );

    return;
  }

  const add = await getPackage();

  const { dependencies } = await readFile(`${app.__dirname}/package.json`);

  if (app.settings.electronType === "hostless")
    add.dependencies = {
      ...add.dependencies,
      ...dependencies,
      websocket: undefined,
    };
  else add.dependencies = { ...add.dependencies, ...dependencies };

  app.writeFileChanged(
    `${app.__dirname}/electron/package.json`,
    JSON.stringify(add, null, "  ").replace(/file:\.\//g, "file:./src/")
  );

  await app.fs.copy(
    `${app.__dirname}/web/build`,
    `${app.__dirname}/electron/src/build`
  );

  await app.fs.copy(
    `${app.__dirname}/web/src/contenttype.json`,
    `${app.__dirname}/electron/src/build/contenttype.json`
  );
};
