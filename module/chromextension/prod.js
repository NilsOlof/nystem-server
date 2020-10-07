module.exports = function (app) {
  if (!app.settings.chromextension) return;

  const { fs } = app;

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
    const buildhtml = fs.readFileSync(
      `${app.__dirname}/build/index.html`,
      "utf8"
    );

    const jsregexp = /<script type="text\/javascript" src="(\/static\/js\/main\.[^.]+\.js)">/gm;
    let match = jsregexp.exec(buildhtml);
    const jscode = fs.readFileSync(
      `${app.__dirname}/build/${match[1]}`,
      "utf8"
    );

    if (manifest.background)
      fs.writeFile(
        `${__dirname}/extension/background.js`,
        getSettings("background") + jscode
      );

    const html = fs.readFileSync(`${__dirname}/base.html`, "utf8");
    if (manifest.browser_action) {
      fs.writeFile(
        `${__dirname}/extension/popup.html`,
        html
          .replace("{prefix}", "popup")
          .replace("{name}", app.atHost.client.name)
      );
      fs.writeFile(
        `${__dirname}/extension/popupbundle.js`,
        getSettings("popup") + jscode
      );
    }

    const cssregexp = /<link href="(\/static\/css\/main\.[^.]+\.css)" rel="stylesheet">/gm;
    match = cssregexp.exec(buildhtml);
    fs.copy(
      `${app.__dirname}/build/${match[1]}`,
      `${__dirname}/extension/main.css`
    );

    fs.copy(
      `${app.__dirname}/build/static/media`,
      `${__dirname}/extension/static/media`
    );
  }

  app.on("start", () => {
    setTimeout(compileAndCopy, 1000);
  });
};
