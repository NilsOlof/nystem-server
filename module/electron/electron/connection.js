module.exports = (app) => {
  if (app.settings.client.domain) return;

  const requestId = app.uuid();
  app.connection = app.addeventhandler({}, ["emit", "broadcast", "count"]);

  app.on("electronData", (data) => {
    data.id = requestId;
    app.connection.event(data.type, data);
  });

  app.connection.on(["emit", "broadcast"], (data) => {
    app.event("electronEvent", data);
  });

  app.connection.on("count", () => 1);
};
