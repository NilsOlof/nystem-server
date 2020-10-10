module.exports = function (app) {
  if (!app.settings.chromextension) return;

  const fetch = require("node-fetch");
  let timer;
  const host = `http://localhost:${app.settings.port}`;
  const extPath = `${app.__dirname}/files/extension/`;

  function update() {
    console.log("Update extension");
    clearTimeout(timer);

    require("./build.js")(app);
  }

  const compileAndCopy = () => {
    update();
    require("./manifest.js")(app);
    [16, 24, 32, 48, 128, 512].forEach((size) => {
      fetch(`${host}/icon/${size}.png`)
        .then((res) => res.buffer())
        .then((buffer) => {
          app.fs.outputFile(`${extPath}icon/${size}.png`, buffer);
        });
    });
  };

  app.on("start", () => {
    setTimeout(compileAndCopy, 1000);
  });

  app.on("debugModeFileChange", (event) => {
    const parts = event.path.split("/");
    if (!["component", "style", "contentType"].includes(parts[3])) return;

    timer = setTimeout(update, 1000);
  });
};
