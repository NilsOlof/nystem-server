module.exports = function (app) {
  require("./session")(app);
  require("./password")(app);
  require("./access")(app);
};
