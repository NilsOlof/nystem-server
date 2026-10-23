export default (app) => {
  let connected = false;
  let updating = Promise.resolve();
  let pendingUpdates = 0;
  const runUpdates = (collection) => {
    pendingUpdates++;
    updating = updating.then(() => collection.updates()).finally(() => pendingUpdates--);
    return updating;
  };
  const collections = [];
  let pollTimer;

  app.on("init", () => {
    ({ connected } = app.connection);
    app.connection.on("connection", async (query) => {
      const reconnect = !connected && query.connected;
      ({ connected } = query);
      clearInterval(pollTimer);
      if (!connected) return;
      if (app.settings.clearDbOnConnect && reconnect) await app.database.clearCache();
      collections.forEach(runUpdates);
      if (query.fallback) pollTimer = setInterval(() => !pendingUpdates && collections.forEach(runUpdates), 30000);
    });
  });

  app.database.on("init", ({ collection, contentType }) => {
    const send = (action, query) =>
      app.connection
        .emit({ type: "database", action, contentType: contentType.machinename, query })
        .then((event) => (event.offline ? { ...query, offline: true } : event.query));

    ["find", "get", "size"].forEach((event) => {
      collection.on(event, 900, (query) =>
        query.data ? undefined : !connected ? { ...query, offline: true } : send(event, query),
      );
    });

    collection.on("delete", 2700, (query) => (!connected ? { ...query, offline: true } : send("delete", query)));

    collection.on("save", 2700, (query) => (!connected ? { ...query, offline: true } : send("save", query)));

    collection.on("search", 1700, (query) =>
      query.inCache ? undefined : !connected ? { ...query, offline: true } : send("search", query),
    );

    collection.on(
      "updates",
      (query) => query.date && (connected ? send("updates", query) : { ...query, offline: true }),
    );
    collection.on("update", 200, (query) => ({ ...query, offline: !connected }));

    app.connection.on("database", (event) => {
      if (event.contentType !== contentType.machinename || !["update"].includes(event.action)) return;

      collection[event.action](event.query);
    });

    collections.push(collection);
    collection.on("init", -100, () => {
      if (app.connection.connected) runUpdates(collection);
    });
  });
};
