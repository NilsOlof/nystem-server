export default async (app) => {
  const database = app.addeventhandler({}, ["init", "add"], "databaseglobal");
  app.database = database;

  await app.require("./eventStorageFile");
  await app.require("./circulatingStorageFile");
  await app.require("./debounceStorageFile");
  await app.require("./connection");
  await app.require("./storage");
  await app.require("./updates");
  await app.require("./client/memdb/index");
  await app.require("./hook");
  await app.require("./validate");

  const initDatabase = (contentTypeName) =>
    app.database
      .init({ contentType: app.contentType[contentTypeName] })
      .then(({ collection }) => collection.init())
      // eslint-disable-next-line no-return-assign
      .then((collection) => (database[contentTypeName] = collection));

  app.database.on("init", ({ collection }) => {
    const queue = [];
    let running = false;

    const next = () => {
      if (running) clearTimeout(running);

      if (!queue.length) {
        running = false;
        return;
      }
      running = setTimeout(next, 140000);
      queue.shift()();
    };

    collection.on("save", 3000, async () => {
      await new Promise((resolve) => {
        queue.push(resolve);

        if (!running) next();
      });
    });

    collection.on("save", -200, next);
  });

  app.on("init", -100, async () => {
    await Promise.all(Object.keys(app.contentType).map(initDatabase)).then(
      () => undefined,
    );
  });
};
