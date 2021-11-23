module.exports = (app) => {
  app.fs.copy(
    `${app.__dirname}/module/electron/electron/preload.js`,
    `${app.__dirname}/electron/src/preload.js`
  );
  app.fs.copy(
    `${app.__dirname}/module/electron/electron/core.js`,
    `${app.__dirname}/electron/src/index.js`
  );

  if (app.fs.existsSync(`${app.__dirname}/electron/src/data/host.json`)) return;

  const settings = { ...app.settings };
  settings.client = { ...app.settings.client };

  if (app.settings.electronType === "hostless") {
    delete settings.port;
    delete settings.client.domain;
  }

  app.fs.writeFile(
    `${app.__dirname}/electron/src/data/host.json`,
    JSON.stringify(settings)
  );
};
