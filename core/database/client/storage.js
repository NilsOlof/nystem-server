module.exports = (app) => {
  if (app.settings.noClientCache) return;

  app.database.on("init", ({ collection, db }) => {
    const id = `dbStorage${collection.contentType.machinename}`;

    collection.on(["save", "delete", "saveStorage"], -1000, () => {
      app.storage.setItemDebounce({ id, value: db.dbArray, delay: 500 });
    });

    collection.on("init", 1000, () =>
      app.storage.getItem({ id }).then(({ value }) => {
        db.dbArray = value || [];
      })
    );

    collection.on("clearCache", () => {
      app.storage.setItemDebounce({ id, value: [], delay: 0 });
      db.dbArray = [];
      db.dbIndex = {};
    });
  });
};
