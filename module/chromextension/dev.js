module.exports = function (app) {
  if (!app.settings.chromextension) return;

  const { fs } = app;
  const fetch = require("node-fetch");
  let timer;

  const manifest = JSON.parse(
    fs.readFileSync(`${__dirname}/manifest/manifest.json`, "utf8")
  );
  function getSettings(component) {
    const settings = app.utils.clone(app.atHost.client);
    settings.extension = true;
    settings.insertComponent = {
      component,
      domSelect: "body",
    };
    return `window.___settings___ = ${JSON.stringify(settings)};`;
  }

  function compileAndCopy() {
    const html = fs.readFileSync(`${__dirname}/base.html`, "utf8");
    if (manifest.browser_action)
      app.writeFileChanged(
        `${__dirname}/extension/popup.html`,
        html
          .replace("{prefix}", "popup")
          .replace("{style}", "<style>body { width:700px; }</style>")
          .replace("{name}", app.atHost.client.name)
      );

    if (fs.existsSync(`${app.__dirname}/build`))
      fs.copy(
        `${app.__dirname}/build/static/media`,
        `${__dirname}/extension/static/media`
      );
    update();
  }
  function update() {
    console.log("Update extension");
    clearTimeout(timer);
    fetch(`http://localhost:${app.settings.port + 5000}/static/js/bundle.js`)
      .then((res) => res.text())
      .then((jscode) => jscode.replace("new SockJS", "{};console.log"))
      .then((jscode) => {
        if (manifest.browser_action)
          app.writeFileChanged(
            `${__dirname}/extension/popupbundle.js`,
            getSettings("extensionPopup") + jscode
          );
        if (manifest.background)
          app.writeFileChanged(
            `${__dirname}/extension/background.js`,
            getSettings("extensionBackground") + jscode
          );
      });
    fetch(
      `http://localhost:${app.settings.port + 5000}/static/js/bundle.js.map`
    )
      .then((res) => res.text())
      .then((jscode) => {
        app.writeFileChanged(`${__dirname}/extension/bundle.js.map`, jscode);
      });
    const css = fs.readFileSync(`${app.__dirname}/web/src/style.css`, "utf8");
    app.writeFileChanged(`${__dirname}/extension/main.css`, css);
  }

  app.on("start", () => {
    setTimeout(compileAndCopy, 1000);
  });

  app.on("debugModeFileChange", (event) => {
    const parts = event.path.split("/");
    if (parts[3] !== "component" && parts[3] !== "style") return;
    timer = setTimeout(update, 1000);
  });
};
