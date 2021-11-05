const connectionM = require("./connection");

module.exports = (app) => {
  if (!app.settings.domain) connectionM(app);

  if (window.electron) {
    window.electron.on((info, data) => app.event("electronData", data));
    app.on("electronEvent", (data) => window.electron.send(data));
  }
};
