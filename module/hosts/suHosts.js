module.exports = function (ev) {
  const fs = require("fs");
  const os = require("os").platform();

  const settings = JSON.parse(
    fs.readFileSync(`${__dirname}/settings.json`, "utf8")
  );
  const path = settings[os];

  ev.on("hosts.get", (query) => ({
    ...query,
    data: fs.readFileSync(path, "utf8"),
  }));

  ev.on("hosts.set", ({ data }) => {
    fs.writeFile(path, data, () => {});
  });
};
