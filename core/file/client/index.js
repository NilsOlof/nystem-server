module.exports = (app) => {
  app.storage = app.addeventhandler(
    {},
    [
      "getItem",
      "setItem",
      "removeItem",
      "getItemMem",
      "setItemMem",
      "removeItemMem",
      "getFile",
      "setFile",
      "removeFile",
      "setItemDebounce",
    ],
    "storage"
  );

  app.storage.on("getItem", async (data) => {
    let val = window.localStorage.getItem(data.id);

    if (val === `nystemCache${data.id}`) {
      const nystemCache = await caches.open("nystem");
      val = await nystemCache.match(val).then((req) => req.json());
    }
    return {
      ...data,
      value: val && (val[0] === "[" || val[0] === "{") ? JSON.parse(val) : val,
    };
  });

  app.storage.on("setItem", async ({ id, value }) => {
    value = typeof value === "string" ? value : JSON.stringify(value);

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
          headers: new Headers({
            "content-type": `application/json`,
            date: new Date(),
            etag: "dbdata",
          }),
        })
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

  const memstore = {};

  app.storage.on("getItemMem", (data) =>
    Object.assign(data, { value: memstore[data.id] })
  );

  app.storage.on("setItemMem", ({ id, value }) => {
    memstore[id] = value;
  });

  app.storage.on("removeItemMem", ({ id }) => {
    delete memstore[id];
  });
  /*
  app.storage.on("getFile", (data) => {});

  app.storage.on("setFile", ({ id, value }) => {});

  app.storage.on("removeFile", ({ id }) => {});
  */
};
