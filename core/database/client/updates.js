module.exports = (app) => {
  app.database.on("init", ({ collection, db, contentType }) => {
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
      if (timer03) clearTimeout(timer03);
      timer03 = setTimeout(updateEvent, timeoutTimes[0]);
      if (!timer20) timer20 = setTimeout(updateEvent, timeoutTimes[1]);
      if (!ids.includes(query.id)) ids.push(query.id);
    });

    const delItem = (id) => {
      const { dbArray, dbIndex } = db;
      const item = dbIndex[id];
      if (!item) return;

      delete dbIndex[id];
      const pos = dbArray.indexOf(item);
      dbArray.splice(pos, 1);
    };
    collection.on("update", ({ ids, offline }) => {
      if (!offline)
        if (ids) ids.forEach(delItem);
        else {
          db.dbArray = [];
          db.dbIndex = {};
        }

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

    const sortFuncInt = (key) => (a, b) => {
      const x = a[key];
      const y = b[key];
      if (x === undefined) return y === undefined ? 0 : 1;
      if (y === undefined) return -1;
      return x < y ? -1 : x > y ? 1 : 0;
    };
    collection.on("updates", 1000, () => {
      const { dbArray } = db;
      const i = dbArray.length - 1;
      dbArray.sort(sortFuncInt("_chdate"));
      dbArray.reverse();
      if (i === -1 || !dbArray[i]._chdate) return;

      return { date: dbArray[i]._chdate };
    });
    collection.on("updates", -1000, collection.update);
  });
};
