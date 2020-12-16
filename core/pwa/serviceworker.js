const http = require("http");

const regExpVersion = /main\.([0-9a-f]+)\.chunk.js/im;
const fetch = (url) =>
  new Promise((resolve, reject) => {
    http
      .get(url, (resp) => {
        let data = "";
        resp.on("data", (chunk) => {
          data += chunk;
        });
        resp.on("end", () => resolve(data.toString()));
      })
      .on("error", reject);
  });

module.exports = (app) => {
  app.on("start", () => {
    let appVersion = false;

    app.connection.on("getAppVersion", async (query) => {
      if (!appVersion)
        [, appVersion] =
          regExpVersion.exec(
            await fetch(`http://localhost:${app.settings.port}/index.html`)
          ) || [];

      app.connection.emit({ appVersion, ...query });
    });
  });
};
