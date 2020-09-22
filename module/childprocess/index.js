module.exports = function(app) {
  app.on("childprocess.exec", require("./exec"));
  app.on("childprocess.spawn", require("./spawn"));
};
