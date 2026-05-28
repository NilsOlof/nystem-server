import { platform } from "os";

export default async (app) => {
  const { dbPathWin, dbPathMac, dbPath } = app.settings;

  const dbFileBase =
    (platform() === "win32" && dbPathWin) ||
    (platform() === "darwin" && dbPathMac) ||
    dbPath ||
    `${app.__dirname}/data`;

  app.database.on("init", async ({ collection, db, contentType }) => {
    if (["memory"].includes(contentType.storage)) return;

    const dbFile = ["module"].includes(contentType.storage)
      ? `${app.__dirname}/module/${contentType.module}/db/${contentType.machinename}`
      : `${dbFileBase}/db/${contentType.machinename}db`;

    const storage = app[contentType.storage]
      ? app[contentType.storage](dbFile, [])
      : app.debounceStorageFile(dbFile, []);

    collection.on("save", -900, (query) =>
      query.data ? storage.save(db.dbArray, query.data) : undefined,
    );
    collection.on("delete", -900, (query) =>
      query.data ? storage.delete(db.dbArray, query.id) : undefined,
    );

    collection.on("init", 1000, (query) => {
      db.dbArray = storage.get();
    });
  });
};
