module.exports = app => {
  app.database.on("init", ({ collection, db }) => {
    collection.on(
      "delete",
      query => {
        const id = query.id || query.data._id;
        const data = query.data || { _id: id };
        return Object.assign(query, { id, oldData: db.dbIndex[id], data });
      },
      1000
    );
    collection.on(
      "delete",
      query => {
        if (!query.data) return;
        const { dbArray, dbIndex } = db;
        delete dbIndex[query.id];
        const pos = dbArray.indexOf(query.oldData);
        dbArray.splice(pos, 1);
      },
      -200
    );
  });
};
