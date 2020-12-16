module.exports = (app) => {
  if (app.settings.debugEvLog) require("./debug/debugEvLog.js")(app);
};
