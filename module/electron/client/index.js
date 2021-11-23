const connectionM = require("./connection");

module.exports = (app) => {
  if (!window.electron) return;
  if (!app.settings.domain) connectionM(app);

  const callbacks = {};

  const send = (data, callback) =>
    new Promise((resolve) => {
      data.callbackClient = app.uuid();
      callbacks[data.callbackClient] = resolve;

      callback();
    });

  const back = (data) => {
    if (!callbacks[data.callbackClient]) return;

    try {
      callbacks[data.callbackClient](data);
    } catch (e) {
      console.log("err", callbacks[data.callbackClient], e);
    }

    delete callbacks[data.callbackClient];
  };

  window.electron.on(async (info, data) => {
    if (data.callbackClient) back(data);
    else {
      data = await app.event("electronData", data);
      if (data.callbackServer) window.electron.send(data);
    }
  });

  app.on("electronEvent", (data) => {
    if (data.noCallback) window.electron.send(data);
    else return send(data, () => window.electron.send(data));
  });
};
