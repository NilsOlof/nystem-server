module.exports = (app) => {
  let connected = false;
  app.on("init", () => {
    connected = app.connection.connected();
    app.connection.on("connect", () => {
      connected = true;
    });
    app.connection.on("disconnect", () => {
      connected = false;
    });
  });

  app.database.on("init", ({ collection, db, contentType }) => {
    const send = (action, query) =>
      app.connection
        .emit({
          type: "database",
          action,
          contentType: contentType.machinename,
          query,
        })
        .then((event) => event.query);

    ["find", "get", "size"].forEach((event) => {
      collection.on(event, 900, (query) =>
        query.data
          ? undefined
          : !connected
          ? { ...query, offline: true }
          : send(event, query)
      );
    });

    collection.on("delete", 700, (query) =>
      !connected ? { ...query, offline: true } : send("delete", query)
    );

    collection.on("save", 700, (query) =>
      !connected ? { ...query, offline: true } : send("save", query)
    );

    collection.on("search", 1700, (query) =>
      query.inCache
        ? undefined
        : !connected
        ? { ...query, offline: true }
        : send("search", query)
    );

    collection.on("updates", (query) => send("updates", query));
    collection.on("update", 200, (query) => ({
      ...query,
      offline: !connected,
    }));

    app.connection.on("database", (event) => {
      if (
        event.contentType !== contentType.machinename ||
        !["update"].includes(event.action)
      )
        return;
      collection[event.action](event.query);
    });

    app.connection.on("connect", () => {
      collection.updates();
    });
  });
};
