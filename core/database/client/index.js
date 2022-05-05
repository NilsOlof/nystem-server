const connectionM = require("./connection");
const updatesM = require("./updates");
const memdbM = require("./memdb");
const cacheM = require("./cache");
const storageM = require("./storage");
const saveQueueM = require("./saveQueue");
const addToCacheM = require("./addToCache");

module.exports = (app) => {
  const database = app.addeventhandler(
    {},
    ["init", "add", "clearCache"],
    "databaseglobal"
  );
  app.database = database;

  connectionM(app);
  updatesM(app);
  memdbM(app);
  cacheM(app);
  storageM(app);
  saveQueueM(app);
  addToCacheM(app);

  database.on("clearCache", () =>
    Promise.all(
      Object.keys(app.contentType)
        .filter((item) => database[item])
        .map((item) => database[item].event("clearCache"))
    )
  );

  const initDatabases = (contentTypes) =>
    contentTypes
      .filter((contentType) => contentType.storage !== "none")
      .map((contentType) =>
        database
          .init({ contentType })
          .then(({ collection }) => collection.init())
          .then(
            // eslint-disable-next-line no-return-assign
            (collection) => (database[contentType.machinename] = collection)
          )
      );

  app.on("init", -100, () => {
    app.connection.on("databaseUpdate", (data) =>
      database[data.contentType].update(data)
    );
    return Promise.all(initDatabases(Object.values(app.contentType))).then(
      () => {
        app.on(["login", "logout"], () => {
          database.clearCache().then(() => undefined);
        });
      }
    );
  });
};
