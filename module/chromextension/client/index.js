module.exports = (app) => {
  if (!window.chrome.storage) return;
  console.log("chrome extension storage");

  app.on("init", 500, () => {
    app.storage = app.addeventhandler(
      { at: "window.chrome.storage" },
      [
        "clear",
        "getItem",
        "setItem",
        "removeItem",
        "getItemMem",
        "setItemMem",
        "removeItemMem",
        "setItemDebounce",
      ],
      "storage"
    );

    const setItem = (key, value) =>
      new Promise((resolve) => {
        window.chrome.storage.local.set({ [key]: value }, resolve);
      });
    const getItem = (key) =>
      new Promise((resolve) => {
        window.chrome.storage.local.get([key], (result) => {
          console.log("get", key, result);
          resolve(result[key]);
        });
      });
    const removeItem = (key) =>
      new Promise((resolve) => {
        window.chrome.storage.local.remove([key], resolve);
      });
    const clear = () =>
      new Promise((resolve) => {
        window.chrome.storage.local.clear(resolve);
      });

    app.storage.on("getItem", async (data) => {
      let val = await getItem(data.id);

      if (val === `nystemCache${data.id}`) {
        const nystemCache = await caches.open("nystem");
        val = await nystemCache.match(val).then((req) => req.json());
      }
      return {
        ...data,
        value:
          val && (val[0] === "[" || val[0] === "{") ? JSON.parse(val) : val,
      };
    });

    app.storage.on("setItem", async ({ id, value }) => {
      if (!id) return;

      value =
        value === undefined || typeof value === "string"
          ? value
          : JSON.stringify(value);

      try {
        await setItem(id, value);
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
        await setItem(id, `nystemCache${id}`);
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

    app.storage.on("removeItem", async ({ id }) => {
      await removeItem(id);
    });
    app.storage.on("clear", async () => {
      await clear();
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
  });
};
