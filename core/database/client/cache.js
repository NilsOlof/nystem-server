const getKey = (data) => JSON.stringify(data);

module.exports = (app) => {
  if (app.settings.noClientCache) return;

  app.database.on("init", ({ collection, db }) => {
    if (collection.contentType.noClientCache) return;

    const insertItem = (item) => {
      const { dbIndex, dbArray } = db;
      if (dbIndex[item._id]) return;

      dbIndex[item._id] = item;

      const chdate = item._chdate;
      let pos = dbArray.length - 1;

      if (chdate)
        while (
          pos >= 0 &&
          (!dbArray[pos]._chdate || dbArray[pos]._chdate > chdate)
        )
          pos -= 1;

      if (pos === dbArray.length - 1) dbArray.push(item);
      else dbArray.splice(pos + 1, 0, item);

      collection.event("saveStorage");
    };

    let searchCache = {};
    let allInCache = false;

    collection.on(["update", "clearCache"], 2000, () => {
      searchCache = {};
      allInCache = false;
    });

    collection.on("search", 2000, (query) => {
      const inCache =
        allInCache || searchCache[getKey({ ...query, data: undefined })];

      return { ...query, inCache };
    });
    collection.on("search", -1000, (query) => {
      if (!query.data || allInCache) return;

      allInCache =
        query.count > query.searchTotal && query.searchTotal === query.total;

      query.data.forEach(insertItem);

      const key = getKey({ ...query, data: undefined });
      if (!searchCache[key]) searchCache[key] = true;
    });

    collection.on(["get", "find"], -1000, ({ data }) => {
      if (!allInCache && data) insertItem(data);
    });
  });
};
