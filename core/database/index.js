module.exports = function (app) {
  const database = app.addeventhandler({}, ["init", "add"], "databaseglobal");
  app.database = database;

  require("./connection")(app);
  require("./storage")(app);
  require("./client/debug")(app);
  require("./updates")(app);
  require("./client/memdb")(app);
  require("./hook")(app);

  const initDatabase = (contentTypeName) =>
    app.database
      .init({ contentType: app.contentType[contentTypeName] })
      .then(({ collection }) => collection.init())
      // eslint-disable-next-line no-return-assign
      .then((collection) => (database[contentTypeName] = collection));

  app.on("init", -100, () =>
    Promise.all(Object.keys(app.contentType).map(initDatabase)).then(
      () => undefined
    )
  );
};
