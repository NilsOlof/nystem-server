import { pathToFileURL } from "node:url";
import setLogger from "./errorLog.js";
import { client } from "./connection.js";

const ev = client();
// Logging needs no RPC reply, and must not create new rejections on disconnect.
setLogger((log) => ev.notify("log2", { log }));

ev.on("requireSu.start", async ({ path, settings }) => {
  const mod = await import(pathToFileURL(path));
  await mod.default({ settings, ...ev });
  console.log("requireSu.start", path);
});
ev.event("requireSu.worker.started").catch(() => ev.close());

const close = () => {
  ev.close();
};

process.on("SIGINT", close);
process.on("SIGTERM", close);
process.on("exit", close);

console.log("Started");
