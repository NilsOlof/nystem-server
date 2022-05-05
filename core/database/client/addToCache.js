module.exports = (app) => {
  const addToCache = (item, value, addMedia) => {
    if (!value) return;

    if (item.type === "reference") {
      value = value instanceof Array ? value : [value];
      value.forEach((id) => {
        app.event("addToCache", { id, contentType: item.source, addMedia });
      });
    }

    if (item.type === "group")
      item.item.forEach((item) => addToCache(item, value[item.id], addMedia));

    if (item.type === "multigroup") {
      const val = value[item.id] || [];
      val.forEach((itemval, index) =>
        item.item.forEach((item) =>
          addToCache(item, val[index][item.id], addMedia)
        )
      );
    }
  };

  const added = {};

  app.on("addToCache", 100, ({ contentType, id, addMedia }) => {
    if (added[contentType] && added[contentType][id]) return;

    added[contentType] = added[contentType] || {};
    added[contentType][id] = true;

    const collection = app.database[contentType];
    const items = app.contentType[contentType].item;

    return new Promise((resolve, reject) => {
      collection.get({ id }).then(({ data }) => {
        resolve({ contentType, id, addMedia, value: data });

        items.forEach((item) => {
          addToCache(item, data[item.id], addMedia);
        });
      });
    });
  });

  app.database.on("init", ({ collection, contentType }) => {
    collection.on("update", ({ ids, offline }) => {
      if (offline || !added[contentType]) return;

      if (ids && ids.length < 500) {
        ids.forEach((id) => {
          delete added[contentType][id];
        });

        return;
      }
      delete added[contentType];
    });
  });
};
