module.exports = (app) => {
  if (app.settings.noClientCache) return;

  app.database.on("init", ({ collection, db }) => {
    const storageId = `dbSaveQueue${collection.contentType.machinename}`;

    let saveQueue = {};
    app.storage
      .getItem({ id: storageId })
      // eslint-disable-next-line no-return-assign
      .then(({ value }) => (saveQueue = value || {}));

    const add = ({ id, data, offline }) => {
      if (!offline) return;
      saveQueue[id] = data;
      app.storage.setItemDebounce({
        id: storageId,
        value: saveQueue,
        delay: 300,
      });
    };
    collection.on("save", -1000, (query) => add(query));
    collection.on("delete", -1000, (query) =>
      add({ ...query, data: "deleted" })
    );

    collection.on("updates", 500, (query) => {
      const { dbArray } = db;
      let { date } = query;
      if (!date) return;

      let i = dbArray.length - 1;

      while (i !== -1 && !saveQueue[dbArray[i]._id]) {
        date = dbArray[i]._chdate;
        i--;
      }
      return { ...query, saveQueue, date };
    });
    collection.on("updates", -500, (query) => {
      saveQueue = {};
      app.storage.setItem({ id: storageId, value: {} });
    });
  });
};
