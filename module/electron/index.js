module.exports = (app) => {
  app.on("electronInit", 100, async () => {
    require("./electron/files")(app);
    require("./electron/devserver")(app);
    require("./electron/connection")(app);
  });
};
