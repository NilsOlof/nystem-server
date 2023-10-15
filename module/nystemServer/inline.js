const start = async (app, db) => {
  const { init, waitInLine } = app.waitInLine;

  const waiter = (uuid) => {
    const callbacks = {};
    return {
      wait: (query) =>
        new Promise((doSearch) => {
          waitInLine(
            "dbSearch",
            () =>
              new Promise((resolve) => {
                const waiterId = uuid();
                callbacks[waiterId] = resolve;
                doSearch({ ...query, waiterId });
              })
          );
        }),
      done: (query) => {
        const { waiterId } = query;
        callbacks[waiterId]();
        delete callbacks[waiterId];
        delete query.waiterId;
      },
    };
  };

  init("dbSearch");
  const itemWaiter = waiter(app.uuid);
  db.on("search", 10000, itemWaiter.wait);
  db.on("search", -10000, itemWaiter.done);
};

module.exports = (app, name) =>
  app.on("start", () => {
    start(app, app.database[name]);
  });
