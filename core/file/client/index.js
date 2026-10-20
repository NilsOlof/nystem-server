export default (app) => {
  app.storage = app.addeventhandler(
    {},
    [
      "clear",
      "getItem",
      "setItem",
      "removeItem",
      "getItemMem",
      "setItemMem",
      "removeItemMem",
      "setItemDebounce",
      "getCollection",
      "setCollection",
      "clearCollection",
    ],
    "storage",
  );

  app.storage.on("getItem", async (data) => {
    let val = window.localStorage.getItem(data.id);

    if (val === `nystemCache${data.id}`) {
      const nystemCache = await caches.open("nystem");

      val = await nystemCache.match(val).then((req) => req && req.json());
    }

    return { ...data, value: val && (val[0] === "[" || val[0] === "{") ? JSON.parse(val) : val };
  });

  app.storage.on("setItem", async ({ id, value }) => {
    if (!id) throw new Error("hej");
    if (
      app.settings.noLoggedOutStorage &&
      !app.session.user &&
      !["havereloaded", "session", "loginTokenId"].includes(id)
    )
      return;

    value = value === undefined || typeof value === "string" ? value : JSON.stringify(value);

    try {
      window.localStorage.setItem(id, value);
    } catch (e) {
      const nystemCache = await caches.open("nystem");
      if (e.code !== 22) return;

      await nystemCache.put(
        `nystemCache${id}`,
        new Response(value, {
          status: 200,
          statusText: "Dbcache",
          headers: new Headers({ "content-type": `application/json`, date: new Date(), etag: "dbdata" }),
        }),
      );
      window.localStorage.setItem(id, `nystemCache${id}`);
    }
  });

  const timer = {};
  app.storage.on("setItemDebounce", ({ id, value, delay }) => {
    clearTimeout(timer[id]);
    timer[id] = setTimeout(() => {
      delete timer[id];
      app.storage.setItem({ id, value });
    }, delay);
  });

  app.storage.on("removeItem", ({ id }) => {
    window.localStorage.removeItem(id);
  });

  let idbClosed = false;
  const idb = new Promise((resolve, reject) => {
    const request = window.indexedDB.open("nystem", 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore("record");
      request.result.createObjectStore("order");
    };
    request.onsuccess = () => {
      request.result.onversionchange = () => {
        request.result.close();
        idbClosed = true;
      };
      resolve(request.result);
    };
    request.onerror = () => reject(request.error);
  });

  const transaction = async (mode, action) => {
    const tx = (await idb).transaction(["record", "order"], mode);
    const result = action(tx);
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
    return result;
  };

  app.storage.on("getCollection", async (data) => {
    const [records, order] = await transaction("readonly", (tx) => [
      tx.objectStore("record").getAll(IDBKeyRange.bound([data.id], [data.id, []])),
      tx.objectStore("order").get(data.id),
    ]);
    const byId = Object.fromEntries(records.result.map((item) => [item._id, item]));

    return { ...data, value: (order.result || []).map((_id) => byId[_id]).filter(Boolean) };
  });

  app.storage.on("setCollection", (data) => {
    const { id, put, remove, order } = data;
    if (idbClosed || (app.settings.noLoggedOutStorage && !app.session.user)) return { ...data, skipped: true };

    return transaction("readwrite", (tx) => {
      const record = tx.objectStore("record");
      put.forEach((item) => record.put(item, [id, item._id]));
      remove.forEach((_id) => record.delete([id, _id]));
      if (order !== undefined) tx.objectStore("order").put(order, id);
    });
  });

  app.storage.on("clear", () => {
    window.localStorage.clear();
    return app.storage.clearCollection();
  });

  app.storage.on("clearCollection", () => {
    if (idbClosed) return;

    return transaction("readwrite", (tx) => {
      tx.objectStore("record").clear();
      tx.objectStore("order").clear();
    });
  });

  const memstore = {};

  app.storage.on("getItemMem", (data) => Object.assign(data, { value: memstore[data.id] }));

  app.storage.on("setItemMem", ({ id, value }) => {
    memstore[id] = value;
  });

  app.storage.on("removeItemMem", ({ id }) => {
    delete memstore[id];
  });
};
