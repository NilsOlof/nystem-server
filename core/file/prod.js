module.exports = (app) => {
  const { fs } = app;

  const cache = {};
  app.on("start", -200, () => {
    app.file.on("get", -100, async ({ id, url, type }) => {
      if (!url) return;

      if (type === "text/html") url = "index.html";

      try {
        let data = cache[url];
        if (!data) {
          data = await fs.readFile(`${app.__dirname}/build/${url}`);

          cache[url] =
            url.indexOf("static/js/main") !== -1 && url.indexOf(".map") === -1
              ? `window.___settings___ = ${JSON.stringify(
                  app.settings.client
                )};${data.toString()}`
              : data;
        }

        app.file.event("response", {
          id,
          headers: { "Content-Type": type },
          data: cache[url],
          closed: true,
        });
      } catch (e) {
        app.file.event("response", {
          id,
          headers: { "Content-Type": type },
          data: "file not found",
          statusCode: 404,
          closed: true,
        });
      }
    });

    if (fs.existsSync(`${app.__dirname}/web/build`))
      fs.readdir(`${app.__dirname}/web/build`, (err, items) => {
        items.forEach((item) => {
          fs.copy(
            `${app.__dirname}/web/build/${item}`,
            `${app.__dirname}/build/${item}`,
            (err) => {
              if (err) return console.error(err);

              console.log("success!");
            }
          );
        }, this);
      });
  });
};
