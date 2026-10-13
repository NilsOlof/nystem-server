export default (app) => {
  if (app.settings.noClientCache) return;

  app.database.on("init", ({ collection }) => {
    const storageId = `dbSaveQueue${collection.contentType.machinename}`;

    let saveQueue = {};
    const copy = (value) => JSON.parse(JSON.stringify(value));
    let storageWrite = Promise.resolve();
    const restored = app.storage.getItem({ id: storageId }).then(({ value }) => {
      // Saves made while the cache loads must take precedence over cached entries.
      saveQueue = { ...value, ...saveQueue };
    });
    const persist = () => {
      const value = copy(saveQueue);
      // Keep cache writes ordered; an older acknowledgement must not overwrite a newer save.
      storageWrite = storageWrite.catch(() => {}).then(() => app.storage.setItem({ id: storageId, value }));
      return storageWrite;
    };

    const add = async ({ id, data, offline, error }) => {
      if (!offline || !id || !data || error) return;
      saveQueue[id] = copy(data);
      await restored;
      await persist();
    };
    collection.on("save", -1000, (query) => add(query));
    collection.on("delete", -1000, (query) =>
      query.data && !query.error ? add({ ...query, data: "deleted" }) : undefined,
    );

    collection.on("updates", 500, async (query) => {
      await restored;
      if (!Object.keys(saveQueue).length) return { ...query, saveQueueAck: undefined };
      // A new offline record may not have a cursor yet. Still send its queued save.
      return { ...query, saveQueue: copy(saveQueue), date: query.date || 1, saveQueueAck: undefined };
    });
    collection.on("updates", -500, async (query) => {
      if (query.offline || !query.saveQueueAck) return;
      for (const [id, data] of Object.entries(query.saveQueueAck)) {
        // The same ID can have a newer local save while its previous value is in flight.
        if (JSON.stringify(saveQueue[id]) === JSON.stringify(data)) delete saveQueue[id];
      }
      await persist();
    });
  });
};
