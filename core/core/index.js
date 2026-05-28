/* eslint-disable import/extensions */

import { randomUUID } from "node:crypto";
import app from "./init.js";

const stTime = performance.now();
await app.require("./package");
await app.require("./exit");

app.uuid = () => randomUUID().replace(/-/g, "");
app.delay = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
app.capFirst = (text) =>
  text && text.substring(0, 1).toUpperCase() + text.substring(1);

app.on("settings", () => app.settings);
const { debug } = app.settings;

for await (let path of app.filePaths) {
  const pathpart = path.split("/");
  if (
    pathpart.length !== 3 ||
    (pathpart[2] === "index.js" && pathpart[1] === "core")
  )
    continue;

  path = `${app.__dirname}/${path}`;

  if (pathpart[2] === "index.js") await app.require(path);

  if (debug && pathpart[2] === "dev.js") await app.require(path);

  if (!debug && pathpart[2] === "prod.js") await app.require(path);
}

(async () => {
  await app.event("init", app);
  await app.event("load", app);
  await app.event("start", app);

  console.log(`load ${(performance.now() - stTime).toFixed(2)}ms`);
  await app.event("started", app);

  console.log("Started");
})();

export default () => app;
