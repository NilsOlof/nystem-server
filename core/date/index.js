module.exports = function(app) {
  app.on("init", () => {
    app.database.on("init", ({ collection, contentType }) => {
      if (
        !contentType._features ||
        contentType._features.indexOf("date") === -1
      )
        return;

      collection.on(
        "save",
        query => {
          query.data._chdate = new Date().getTime();
          if (query.data._crdate) return;
          if (query.oldData && query.oldData._crdate)
            query.data._crdate = query.oldData._crdate;
          else query.data._crdate = query.data._chdate;
        },
        990
      );
    });
  });
};
