module.exports = (app) => {
  if (app.settings.client.domain) return;

  const requestId = app.uuid();
  app.on("electronData", (data) =>
    app.connection.event(data.type, { ...data, id: requestId })
  );

  app.connection.on(["emit", "broadcast"], (data) =>
    app.event("electronEvent", data)
  );

  app.connection.on("count", () => 1);
};
