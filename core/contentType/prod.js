module.exports = (app) => {
  const { fs } = app;
  const srcPath = `${app.__dirname}/web/src/contenttype.json`;
  const distPath = `${app.__dirname}/build/contenttype.json`;

  app.on(
    "init",
    () =>
      new Promise((resolve, reject) => {
        if (fs.existsSync(srcPath))
          fs.readFile(srcPath, "utf8", (err, data) => {
            app.contentType = JSON.parse(data);
            fs.outputFile(distPath, JSON.stringify(app.contentType), () => {});
            resolve();
          });
        else
          fs.readFile(distPath, "utf8", (err, data) => {
            app.contentType = JSON.parse(data);
            resolve();
          });
      }),
    400
  );
};
