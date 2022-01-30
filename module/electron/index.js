module.exports = (app) => {
  app.on("electronReady", 100, async () => {
    require("./electron/files")(app);
    require("./electron/devserver")(app);
    require("./electron/connection")(app);
    require("./electron/menubar")(app);
  });
  app.on("started", () => {
    require("./package.js")(app);
  });
};
