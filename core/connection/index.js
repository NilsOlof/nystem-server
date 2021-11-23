module.exports = (app) => {
  if (!app.settings.client.domain) return;

  require("./httpsfallback")(app);

  const clients = {};
  let connectedCount = 0;
  const WebSocketServer = require("websocket").server;
  let partData = ""; // For larger data than 64000 bytes
  const wsServer = new WebSocketServer({
    httpServer: app.server,
  });

  wsServer.on("request", (request) => {
    if (request.resourceURL.pathname !== "/") return;

    connectedCount++;
    const connection = request.accept(null, request.origin);

    const requestId = app.uuid();

    if (app.atHost.debug) console.log("Connection open");

    function emit(data) {
      data = JSON.stringify(data);
      connection.send(data);
    }

    clients[requestId] = { id: requestId, emit };

    app.connection.event("connect", {
      id: requestId,
      request,
    });

    connection.on("message", (message) => {
      if (message.type !== "utf8" || message.utf8Data === "li") return;

      if (message.utf8Data.toString().length === 64000) {
        partData += message.utf8Data;
        return;
      }

      if (partData) {
        message.utf8Data = partData + message.utf8Data;
        partData = "";
      }

      const data = JSON.parse(message.utf8Data);
      data.id = requestId;

      app.connection
        .event(data.type, data)
        .then((result) => result.callbackClient && emit(result));
    });

    connection.on("close", () => {
      connectedCount--;
      if (app.settings.debug) console.log("Client closed");
      delete clients[requestId];
      app.connection.event("disconnect", requestId);
    });
  });

  app.connection = app.addeventhandler({}, ["emit", "broadcast", "count"]);

  app.connection.on("emit", (data) => {
    if (clients[data.id]) clients[data.id].emit(data);
  });

  app.connection.on("broadcast", (data) => {
    Object.values(clients)
      .filter((client) => client.id !== data.id)
      .forEach((client) => client.emit(data));
  });

  app.connection.on("count", () => connectedCount);
};
