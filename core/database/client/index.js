import connection from "./connection";
import updates from "./updates";
import memdb from "./memdb";
import cache from "./cache";
import storage from "./storage";
import saveQueue from "./saveQueue";
import addToCache from "./addToCache";

export default (app) => {
  const database = app.addeventhandler(
    {},
    ["init", "add", "clearCache"],
    "databaseglobal",
  );
  app.database = database;

  connection(app);
  updates(app);
  memdb(app);
  cache(app);
  storage(app);
  saveQueue(app);
  addToCache(app);

  database.on("clearCache", () =>
    Promise.all(
      Object.keys(app.contentType)
        .filter((item) => database[item])
        .map((item) => database[item].event("clearCache")),
    ),
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
            (collection) => (database[contentType.machinename] = collection),
          ),
      );

  app.on("init", -100, () => {
    app.connection.on("databaseUpdate", (data) =>
      database[data.contentType].update(data),
    );
    return Promise.all(initDatabases(Object.values(app.contentType))).then(
      () => {
        app.on(["login", "logout"], () => {
          database.clearCache().then(() => undefined);
        });
      },
    );
  });
};
