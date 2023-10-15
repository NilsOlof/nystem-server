/* eslint-disable import/extensions */

const crypto = require("crypto");
const app = require("./init");

const stTime = performance.now();
require("./package.js")(app);
require("./exit.js")(app);

app.uuid = () => crypto.randomUUID().replace(/-/g, "");
app.delay = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
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

  console.log(`load ${(performance.now() - stTime).toFixed(2)}ms`);
  await app.event("started", app);

  console.log("Started");
})();

module.exports = () => app;
