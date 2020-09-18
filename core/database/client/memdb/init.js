module.exports = app => {
  app.database.on("init", ({ collection, db }) => {
    collection.on("init", 1000, query => Object.assign(db, query));
    collection.on("init", -1000, () => {
      /* collection.on(
        "init",
        () => {
          throw new Error("Initited already");
        },
        1001
      ); */
      return collection;
    });
  });
};
