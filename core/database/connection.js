module.exports = (app) => {
  app.database.on("init", ({ collection, db }) => {
    const { connection } = app;
    const { machinename } = collection.contentType;
    const requestLoads = {};

    connection.on("disconnect", (requestId) => {
      delete requestLoads[requestId];
    });

    collection.on("update", (query) => {
      Object.keys(requestLoads).forEach((id) => {
        connection.emit({
          type: "database",
          action: "update",
          id,
          query,
          contentType: machinename,
        });
      });
    });

    connection.on("database", (event) => {
      if (
        event.contentType !== machinename ||
        ![
          "get",
          "find",
          "save",
          "search",
          "delete",
          "size",
          "update",
          "updates",
        ].includes(event.action)
      )
        return;

      const { query } = event;
      requestLoads[event.id] = true;
      const callDatabase = event.database || event.contentType;
      app.session
        .add(event)
        .then((data) => {
          query.session = data.session;
          query.requestId = data.id;
          return query;
        })
        .then(collection[event.action])
        .then((query) => {
          delete event.session;
          delete query.session;
          delete query.oldData;
          delete query.requestId;
          event.query = query;
          connection.emit(event);
        });
    });
  });
};
