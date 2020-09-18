module.exports = (app) => {
  if (app.settings.noClientCache) return;

  app.database.on("init", ({ collection, db }) => {
    const insertItem = (item) => {
      const { dbIndex, dbArray } = db;
      if (dbIndex[item._id]) return;
      dbIndex[item._id] = item;

      const chdate = item._chdate;

      if (!item.chdate) dbArray.push(item);
      else
        for (let i = 0; i < dbArray.length; i++)
          if (dbArray[i]._chdate < chdate) {
            dbArray.splice(i, 0, item);
            break;
          }
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
        allInCache ||
        searchCache[JSON.stringify({ ...query, data: undefined })];

      return { ...query, inCache };
    });
    collection.on("search", -1000, (query) => {
      if (!query.data || allInCache) return;

      allInCache =
        query.count > query.searchTotal && query.searchTotal === query.total;

      query.data.forEach(insertItem);

      const key = JSON.stringify({ ...query, data: undefined });
      if (!searchCache[key]) searchCache[key] = true;
    });

    collection.on(["get", "find"], -1000, ({ data }) => {
      if (!allInCache && data) insertItem(data);
    });
  });
};
