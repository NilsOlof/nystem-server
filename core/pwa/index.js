module.exports = (app) => {
  require("./favicon")(app);
  require("./serviceworker")(app);
};
