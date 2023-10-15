module.exports = (app) => {
  app.database.on("init", ({ collection, db }) => {
    collection.on("delete", 1000, (query) => {
      const id = query.id || query.data._id;
      const data = query.data || { _id: id };
      return { ...query, id, oldData: db.dbIndex[id], data };
    });

    collection.on("delete", -200, (query) => {
      if (!query.data) return;
      const { dbArray, dbIndex } = db;
      delete dbIndex[query.id];
      const pos = dbArray.indexOf(query.oldData);
      dbArray.splice(pos, 1);
    });
  });
};
