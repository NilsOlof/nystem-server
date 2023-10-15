module.exports = (app) => {
  const timeoutTimes = (app.settings.client.database &&
    app.settings.client.database.updateFrequency) || [300, 2000];

  app.database.on("init", ({ collection, db }) => {
    const updateSearch = {};
    const updateGet = {};
    let timer03;
    let timer20;
    let ids = [];
    const updateEvent = () => {
      clearTimeout(timer03);
      clearTimeout(timer20);
      timer20 = false;
      collection.event("update", { ids }).then(() => {
        ids = [];
      });
    };

    collection.on("get", -1000, (query) => {
      if (query.onData) {
        query.onData(query);
        query.callbackId = query.callbackId || app.uuid();
        updateGet[query.id] = updateGet[query.id] || {};
        updateGet[query.id][query.callbackId] = query.onData;
      }
    });

    collection.on("search", -1000, (query) => {
      if (query.onData) {
        query.onData(query);
        query.callbackId = query.callbackId || app.uuid();
        updateSearch[query.callbackId] = { ...query, data: false };
      }
    });

    collection.on("offUpdate", (query) => {
      if (updateSearch[query.callbackId]) delete updateSearch[query.callbackId];
      else delete updateGet[query.id][query.callbackId];
    });

    collection.on(["save", "delete"], -1000, (query) => {
      if (!query.data) return;
      if (timer03) clearTimeout(timer03);
      timer03 = setTimeout(updateEvent, timeoutTimes[0]);
      if (!timer20) timer20 = setTimeout(updateEvent, timeoutTimes[1]);
      if (!ids.includes(query.id)) ids.push(query.id);
    });

    collection.on("update", ({ ids }) => {
      Object.values(updateSearch).forEach((search) =>
        collection.search(search)
      );
      ids.forEach((id) => {
        if (updateGet[id])
          Object.values(updateGet[id]).forEach((callbackId) =>
            collection
              .get({ id })
              .then((query) => updateGet[id][callbackId](query))
          );
      });
    });

    collection.on("updates", (query) => {
      if (collection.contentType.staticContent) return { ...query, ids: [] };

      let ids = [];
      const { dbArray } = db;
      let i = dbArray.length - 1;

      if (i === -1 || !dbArray[i]._chdate || !query.date) return;

      while (i !== -1 && dbArray[i]._chdate > query.date) {
        ids.push(dbArray[i]._id);
        i--;
      }
      if (ids.length > 100) ids = undefined;

      return { ...query, ids };
    });
    collection.on("updates", (query) => {
      const { saveQueue, session } = query;
      if (!saveQueue) return;

      const { dbIndex } = db;
      Object.keys(saveQueue).forEach((id) => {
        const item = dbIndex[id];

        if (saveQueue[id] === "deleted") {
          collection.delete({ id, data: saveQueue[id], session });
          return;
        }

        if (item && item._chdate && item._chdate >= saveQueue[id]._chdate)
          return;

        collection.save({ data: saveQueue[id], session });
      });

      return { ...query, saveQueue: undefined };
    });
  });
};
