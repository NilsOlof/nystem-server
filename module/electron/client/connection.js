module.exports = (app) => {
  if (app.settings.domain) return;

  app.connection = app.addeventhandler({}, ["emit", "broadcast"], "connection");
  const { connection } = app;

  connection.on("broadcast", (data) =>
    app.event("electronEvent", { ...data, broadcast: true })
  );
  connection.on("emit", (data) => app.event("electronEvent", data));

  app.on("electronData", (data) => connection.event(data.type, data));

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
