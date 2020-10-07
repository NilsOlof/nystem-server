module.exports = function (app) {
  if (!app.settings.chromextension) return;

  const { fs } = app;
  const fetch = require("node-fetch");
  let timer;
  const host = `http://localhost:${app.settings.port}`;

  function update() {
    console.log("Update extension");
    clearTimeout(timer);

    const css = fs.readFileSync(`${app.__dirname}/web/src/index.css`, "utf8");
    app.writeFileChanged(`${__dirname}/extension/main.css`, css);

    [16, 24, 32, 48, 128, 512].forEach((size) => {
      fetch(`${host}/icon/${size}.png`)
        .then((res) => res.buffer())
        .then((buffer) => {
          app.fs.outputFile(`${__dirname}/extension/icon/${size}.png`, buffer);
        });
    });
  }

  app.on("start", () => {
    // setTimeout(compileAndCopy, 1000);
  });

  app.on("debugModeFileChange", (event) => {
    const parts = event.path.split("/");
    if (parts[3] !== "component" && parts[3] !== "style") return;
    timer = setTimeout(update, 1000);
  });
};
