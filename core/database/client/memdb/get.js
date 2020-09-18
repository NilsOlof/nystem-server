module.exports = app => {
  app.database.on("init", ({ collection, db }) => {
    collection.on(
      "get",
      1000,
      query =>
        query.data
          ? query
          : { ...query, data: db.dbIndex[query.id] }
    );
  });
};
