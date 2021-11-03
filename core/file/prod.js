module.exports = (app) => {
  const { fs } = app;
  const mime = require("mime");
  const cache = {};

  app.on("start", -200, () => {
    app.express.get("/*", (req, res) => {
      const isHtml = req.params[0].indexOf(".") === -1;
      const path = isHtml ? "index.html" : req.params[0];
      const type = mime.getType(path);
      if (app.isCached(type, req, res)) return;

      if (!cache[path]) {
        fs.readFile(`${app.__dirname}/build/${path}`, (err, data) => {
          cache[path] =
            path.indexOf("static/js/main") !== -1 && path.indexOf(".map") === -1
              ? `window.___settings___ = ${JSON.stringify(
                  app.settings.client
                )};${data}`
              : data;
          app.compressRes(cache[path], req, res);
        });
      } else app.compressRes(cache[path], req, res);
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
