const setLog = require("./errorLog");
const { client } = require("./connection");

const ev = client();
setLog((log) => ev.event("log", { log }));

ev.on("requireSu.start", async ({ path, settings }) => {
  await require(path)({ settings, ...ev });
  console.log("requireSu.start", path);
});
ev.event("requireSu.worker.started");

console.log("Started");
