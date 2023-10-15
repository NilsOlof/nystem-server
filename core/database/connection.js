module.exports = (app) => {
  app.database.on("init", ({ collection, db }) => {
    const { connection } = app;
    const { machinename } = collection.contentType;
    const requestLoads = {};

    connection.on("disconnect", (requestId) => {
      delete requestLoads[requestId];
    });

    collection.on("update", (query) =>
      Object.keys(requestLoads).forEach((id) =>
        connection.emit({
          type: "database",
          action: "update",
          id,
          query,
          contentType: machinename,
        })
      )
    );

    const actions = [
      "get",
      "find",
      "save",
      "search",
      "delete",
      "size",
      "update",
      "updates",
    ];

    connection.on("database", async (event) => {
      if (event.contentType !== machinename || !actions.includes(event.action))
        return;

      let { query } = event;
      requestLoads[event.id] = true;

      const data = await app.session.add(event);
      query.session = data.session;
      query.requestId = data.id;
      query.role = query.role || data.session?.role;
      query = await collection[event.action](query);

      delete event.session;
      delete query.session;
      delete query.oldData;
      delete query.requestId;

      event.query = query;
    });
  });
};
