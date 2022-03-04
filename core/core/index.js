/* eslint-disable import/extensions */
const http = require("http");
const app = require("./init");

require("./package.js")(app);

console.time("load"); // eslint-disable-line no-console
app.cacheTimeStart = new Date();

if (app.settings.client.domain) {
  try {
    app.express = require("express")();

    app.server = http.createServer(app.express);

    app.express.use((req, res, next) => {
      res.removeHeader("x-powered-by");
      next();
    });
  } catch (e) {
    console.log("Modules missing, exiting.");
    return;
  }
} else app.express = { get: () => {}, post: () => {} };

require("./exit.js")(app);

const S4 = () =>
  // eslint-disable-next-line no-bitwise
  (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
app.uuid = () => S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4();
app.capFirst = (text) =>
  text && text.substring(0, 1).toUpperCase() + text.substring(1);

app.on("settings", () => app.settings);
const { debug } = app.settings;

app.filePaths.forEach((path) => {
  const pathpart = path.split("/");
  if (
    pathpart.length !== 3 ||
    (pathpart[2] === "index.js" && pathpart[1] === "core")
  )
    return;

  path = `${app.__dirname}/${path}`;
  if (pathpart[2] === "index.js") require(path)(app);

  if (debug && pathpart[2] === "dev.js") require(path)(app);

  if (!debug && pathpart[2] === "prod.js") require(path)(app);
});

(async () => {
  await app.event("init", app);
  await app.event("load", app);
  await app.event("start", app);

  console.timeEnd("load"); // eslint-disable-line no-console
  if (app.settings.port)
    app.server.listen(app.settings.port, app.settings.host);

  await app.event("started", app);
  console.log("Started");
})();

module.exports = () => app;
