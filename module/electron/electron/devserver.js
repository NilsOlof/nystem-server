const http = require("http");

const fetch = (url) =>
  new Promise((resolve, reject) => {
    http
      .request(url, (response) => {
        let data = "";

        response.on("data", (chunk) => {
          data += chunk;
        });

        response.on("end", () => {
          resolve(data);
        });

        response.on("error", (error) => {
          console.log(error);
          reject(error);
        });
      })
      .end();
  });

module.exports = (app) => {
  app.on("electronInit", async ({ mainWindow }) => {
    if (app.settings.debug)
      app.on("electronInit", async ({ mainWindow }) => {
        mainWindow.webContents.openDevTools();
      });

    await app.waitFor("started");
    if (!app.settings.port) return;

    let html;

    if (app.settings.debug) {
      const url = `http://${app.settings.client.domain}/`;
      html = await fetch(url);

      html = html
        .replace(/src="\//g, `src="${url}`)
        .replace(/href="\//g, `href="${url}`);
    } else {
      html = await app.fs.readFile(`${app.__dirname}/build/index.html`, "utf8");

      html = html
        .replace(/src="\//g, `src="build/`)
        .replace(/href="\//g, `href="build/`);

      const mainJs = /src="(build\/static\/js\/main\.[^.]+\.chunk\.js)/gim;
      const filename = `${app.__dirname}/${mainJs.exec(html)[1]}`;
      let jsFile = await app.fs.readFile(filename, "utf8");

      jsFile = jsFile.replace(/window\.___settings___ = [^;]+;/gim, "");
      jsFile = `window.___settings___ = ${JSON.stringify(
        app.settings.client
      )};${jsFile}`;

      await app.fs.writeFile(filename, jsFile);
    }

    await app.fs.writeFile(`${app.__dirname}/index.html`, html);
    mainWindow.setIcon(`${app.__dirname}/icon.png`);
  });
};
