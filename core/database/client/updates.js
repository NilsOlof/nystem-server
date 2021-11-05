module.exports = (app) => {
  app.database.on("init", ({ collection, db }) => {
    let ids = [];
    const updateSearch = {};
    const updateGet = {};
    let timer03;
    let timer20;

    const timeoutTimes = (app.settings.database &&
      app.settings.database.updateFrequency) || [300, 2000];

    const updateEvent = () => {
      clearTimeout(timer03);
      clearTimeout(timer20);
      timer20 = false;
      collection.event("update", { ids }).then(() => {
        ids = [];
      });
    };

    collection.on("get", 1000, (query) => {
      if (!query.onData || query.callbackId) return;
      query.callbackId = app.uuid();
      updateGet[query.id] = updateGet[query.id] || {};
      updateGet[query.id][query.callbackId] = query.onData;
      delete query.onData;
    });
    collection.on("get", -1000, (query) => {
      if (query.callbackId) updateGet[query.id][query.callbackId](query);
    });

    collection.on("search", 1000, (query) => {
      if (!query.onData || query.callbackId) return;
      query.callbackId = app.uuid();
      updateSearch[query.callbackId] = { ...query, data: false };
      delete query.onData;
    });
    collection.on("search", -1000, (query) => {
      if (query.callbackId) updateSearch[query.callbackId].onData(query);
    });

    collection.on("offUpdate", (query) => {
      if (updateSearch[query.callbackId]) delete updateSearch[query.callbackId];
      else delete updateGet[query.id][query.callbackId];
    });

    collection.on(["save", "delete"], -1000, (query) => {
      if (!query.offline) return;

      if (timer03) clearTimeout(timer03);
      timer03 = setTimeout(updateEvent, timeoutTimes[0]);
      if (!timer20) timer20 = setTimeout(updateEvent, timeoutTimes[1]);
      if (!ids.includes(query.id)) ids.push(query.id);
    });

    const delItem = (id) => {
      // Not working, strange...
      // dbArray.splice(dbArray.indexOf(dbIndex[id]),1);
      db.dbArray = db.dbArray.filter((i) => i._id !== id);
      delete db.dbIndex[id];
    };

    collection.on("update", ({ ids, offline }) => {
      if (offline) return;
      if (ids) {
        ids.forEach(delItem);
        return;
      }

      db.dbArray = [];
      db.dbIndex = {};
    });

    collection.on("update", -1000, ({ ids }) => {
      Object.values(updateSearch).forEach((query) =>
        collection.search({ ...query, data: false, onData: false })
      );

      const updateGetIds = ids
        ? ids.filter((id) => updateGet[id])
        : Object.keys(updateGet);

      updateGetIds.forEach((id) => {
        Object.values(updateGet[id]).forEach((callbackId) =>
          collection
            .get({ id })
            .then((query) => updateGet[id][callbackId](query))
        );
      });

      collection.event("saveStorage");
    });

    collection.on("updates", 1000, () => {
      const { dbArray } = db;
      const i = dbArray.length - 1;

      if (i === -1 || !dbArray[i]._chdate) return;

      return { date: dbArray[i]._chdate };
    });
    collection.on("updates", -1000, collection.update);
  });
};
