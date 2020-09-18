module.exports = function(app) {
  require("./session.js")(app);
  require("./password.js")(app);
  require("./access.js")(app);
};
