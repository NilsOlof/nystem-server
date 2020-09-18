module.exports = app => {
  app.database.on("init", ({ collection }) => {
    collection.on(
      "save",
      query => (query.hook ? query.hook(query) || undefined : undefined)
    );
  });
};
