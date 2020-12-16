module.exports = (app) => {
  app.database.on("init", ({ collection, db }) => {
    collection.on("save", 2000, (query) => {
      const id = query.id || (query.data && query.data._id);
      if (!id || query.oldData) return;

      const oldData = db.dbIndex[id];
      if (!oldData) return;

      if (query.fields) query.data = { ...oldData, ...query.data };
      return { ...query, oldData };
    });

    collection.on("save", 1000, (query) => {
      if (!query.data) return;

      // eslint-disable-next-line no-multi-assign
      query.data._id = query.id = query.id || query.data._id || app.uuid();
    });

    collection.on("save", -100, (query) => {
      if (!query.data) return;

      const { dbArray, dbIndex } = db;

      if (query.oldData) {
        dbArray.splice(dbArray.indexOf(query.oldData), 1);
        delete dbIndex[query.oldData._id];
      }

      dbIndex[query.id] = query.data;
      dbArray.push(query.data);
    });
  });
};
