const regExpVersion = /main\.([0-9a-f]+)\.js/im;

module.exports = (app) => {
  app.on("start", () => {
    let appVersion = false;

    app.connection.on("getAppVersion", async (query) => {
      if (!appVersion && app.settings.port) {
        const html = await app.fs.readFile(
          `${app.__dirname}/build/index.html`,
          "utf8"
        );
        [, appVersion] = regExpVersion.exec(html) || [];
      }

      return { appVersion, ...query };
    });
  });
};
