const { client } = require("./connection");

const ev = client();

ev.on("requireSu.start", ({ path, settings }) => {
  require(path)({ settings, ...ev });
});
