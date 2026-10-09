import { resolve, sep } from "node:path";

export default (app) => {
  const { fs } = app;
  const buildFolder = resolve(`${app.__dirname}/build`);

  const cache = {};
  app.on("start", -200, () => {
    app.file.on("get", -100, async ({ id, url, type }) => {
      if (!url) return;

      if (type === "text/html") url = "index.html";

      // Only serve files inside the build folder
      const filePath = resolve(buildFolder, `.${url.startsWith("/") ? "" : "/"}${url}`);
      if (!filePath.startsWith(buildFolder + sep)) {
        app.file.event("response", { id, type, data: "file not found", statusCode: 404, closed: true });
        return;
      }

      try {
        let data = cache[url];
        if (!data) {
          data = await fs.readFile(filePath);

          cache[url] =
            url.startsWith("/assets/index-") && url.endsWith(".js")
              ? `window.___settings___ = ${JSON.stringify(app.settings.client)};${data.toString()}`
              : data;
        }

        app.file.event("response", { id, type, data: cache[url], closed: true });
      } catch (e) {
        app.file.event("response", { id, type, data: "file not found", statusCode: 404, closed: true });
      }
    });

    if (fs.existsSync(`${app.__dirname}/web/dist`))
      fs.readdir(`${app.__dirname}/web/dist`, (err, items) => {
        items.forEach((item) => {
          fs.copy(`${app.__dirname}/web/dist/${item}`, `${app.__dirname}/build/${item}`, (err) => {
            if (err) return console.error(err);

            console.log("success!");
          });
        }, this);
      });
  });
};
