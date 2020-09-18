module.exports = function(app) {
  function addToCache(item, value, addMedia) {
    if (!value) return;

    if (item.type === "reference") {
      value = value instanceof Array ? value : [value];
      value.forEach(id => {
        app.event("addToCache", { id, contentType: item.source, addMedia });
      });
    }

    if (item.type === "group")
      item.item.forEach(item => addToCache(item, value[item.id], addMedia));

    if (item.type === "multigroup") {
      let val = value[item.id] || [];
      val.forEach((itemval, index) =>
        item.item.forEach(item =>
          addToCache(item, val[index][item.id], addMedia)
        )
      );
    }
  }

  const added = {};

  app.on("addToCache", 100, ({ contentType, id, addMedia }) => {
    if (added[contentType] && added[contentType][id]) return;

    added[contentType] = added[contentType] || {};
    added[contentType][id] = true;

    const collection = app.database[contentType];
    const items = app.contentType[contentType].item;

    return new Promise((resolve, reject) => {
      collection.get({ id }).then(({ data }) => {
        resolve();

        items.forEach(item => {
          addToCache(item, data[item.id], addMedia);
        });
      });
    });
  });
};
