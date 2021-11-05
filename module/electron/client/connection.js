module.exports = (app) => {
  if (app.settings.domain) return;

  app.connection = app.addeventhandler({}, ["emit", "broadcast"], "connection");
  const { connection } = app;

  const callbacks = {};

  const send = (data) =>
    new Promise((resolve) => {
      if (!data.noCallback) {
        data.callbackid = app.uuid();
        callbacks[data.callbackid] = resolve;
      } else resolve();

      app.event("electronEvent", data);
    });

  connection.on("broadcast", (data) => send({ ...data, broadcast: true }));
  connection.on("emit", send);

  app.on("electronData", (data) => {
    if (callbacks[data.callbackid]) {
      try {
        callbacks[data.callbackid](data);
      } catch (e) {
        console.log("err", callbacks[data.callbackid], e);
      }
      delete callbacks[data.callbackid];
    }
    connection.event(data.type, data);
  });

  connection.connected = false;
  connection.on("connection", 100, (query) => {
    if (typeof query.connected === "undefined")
      query.connected = connection.connected;

    connection.connected = query.connected;
  });

  app.on("start", () => {
    connection.event("connection", { connected: true });
  });

  connection.on("connection", ({ wait, connected }) => {
    if (!wait || connected) return;

    return new Promise((resolve) => {
      const onConnect = ({ connected }) => {
        if (!connected) return;
        connection.off("connection", onConnect);
        resolve({ connected: true });
      };
      connection.on("connection", onConnect);
    });
  });
};
