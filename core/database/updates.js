export default (app) => {
  const timeoutTimes = (app.settings.client.database && app.settings.client.database.updateFrequency) || [300, 2000];

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
      Object.values(updateSearch).forEach((search) => collection.search(search));
      ids.forEach((id) => {
        if (updateGet[id])
          Object.values(updateGet[id]).forEach((callbackId) =>
            collection.get({ id }).then((query) => updateGet[id][callbackId](query)),
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
    collection.on("updates", async (query) => {
      const { saveQueue, session } = query;
      if (!saveQueue) return { ...query, saveQueueAck: undefined };
      const saveQueueAck = {};
      const saveQueueErrors = {};

      for (const id of Object.keys(saveQueue)) {
        const queued = JSON.parse(JSON.stringify(saveQueue[id]));
        try {
          const item = db.dbIndex[id];
          // A newer server record supersedes an older queued save.
          if (queued !== "deleted" && item?._chdate && item._chdate >= queued._chdate) {
            saveQueueAck[id] = queued;
            continue;
          }
          const result =
            queued === "deleted"
              ? await collection.delete({ id, data: queued, session })
              : await collection.save({ id, data: JSON.parse(JSON.stringify(queued)), session });
          if (!result?.data || result.error) {
            saveQueueErrors[id] = result?.error || "Queued write was rejected.";
            continue;
          }
          saveQueueAck[id] = queued;
        } catch (error) {
          saveQueueErrors[id] = error.message || "Queued write failed.";
        }
      }

      return { ...query, saveQueue: undefined, saveQueueAck, saveQueueErrors };
    });
  });
};
