var menubar = require("menubar");
var fs = require("fs");
var settings = JSON.parse(
  fs.readFileSync(__dirname + "/../../data/host.json", "utf8")
);
var mb = menubar({
  index: "http://" + settings.client.domain,
  width: 1200,
  height: 800,
  icon: __dirname + "/stat.png",
  tooltip: settings.client.name
});
const { app, protocol } = require("electron");
mb.on("ready", function ready() {
  console.log("app is ready");
});
