export default (app) => {
  if (app.settings.noClientCache) return;

  app.database.on("init", ({ collection, db }) => {
    const id = `dbStorage${collection.contentType.machinename}`;
    let stored = new Set();
    let storedOrder = [];
    let dirty = new Set();
    let reset = false;
    let writing = Promise.resolve();
    let timer;

    const save = () => {
      clearTimeout(timer);
      writing = writing.then(async () => {
        const ids = dirty;
        const resetPending = reset;
        dirty = new Set();
        reset = false;
        const put = [];
        const remove = new Set();
        for (const _id of ids) {
          const item = db.dbIndex[_id];
          if (item) put.push(item);
          else if (stored.has(_id)) remove.add(_id);
        }
        if (resetPending) for (const _id of stored) if (!db.dbIndex[_id]) remove.add(_id);
        if (!put.length && !remove.size) return;

        const order = db.dbArray.map(({ _id }) => _id);
        const orderChanged =
          order.length !== storedOrder.length || order.some((_id, index) => _id !== storedOrder[index]);
        try {
          const { skipped } = await app.storage.setCollection({
            id,
            put,
            remove: [...remove],
            ...(orderChanged ? { order } : {}),
          });
          if (!skipped) {
            put.forEach((item) => stored.add(item._id));
            remove.forEach((_id) => stored.delete(_id));
            if (orderChanged) storedOrder = order;
            return;
          }
        } catch (error) {
          console.error(`Storing ${id} failed`, error);
        }
        ids.forEach((_id) => dirty.add(_id));
        reset = reset || resetPending;
      });
      return writing;
    };

    collection.on(["save", "delete", "saveStorage"], -1000, ({ id, ids, cacheCleared, error }) => {
      if (error) return;
      if (id !== undefined) dirty.add(id);
      if (ids) ids.forEach((_id) => dirty.add(_id));
      reset = reset || cacheCleared;
      if (!dirty.size && !reset) return;
      clearTimeout(timer);
      timer = setTimeout(save, 500);
    });

    collection.on("init", 1000, (query) =>
      app.storage.getCollection({ id }).then(
        ({ value }) => {
          db.dbArray = value;
          storedOrder = value.map(({ _id }) => _id);
          stored = new Set(storedOrder);
          return query;
        },
        (error) => {
          console.error(`Loading ${id} failed`, error);
          return query;
        },
      ),
    );

    collection.on("clearCache", () => {
      db.dbArray = [];
      db.dbIndex = {};
      reset = true;
      return save();
    });
  });
};
