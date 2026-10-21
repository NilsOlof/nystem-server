export default (app) => {
  const root = globalThis;
  const hasWindow = typeof window !== "undefined";
  const chromeApi = root.chrome || (hasWindow && window.chrome);
  const inExtension =
    chromeApi?.runtime?.id &&
    hasWindow &&
    (window.location.protocol === "chrome-extension:" || window.location.pathname === "/popup.html");
  const storage = () => chromeApi?.runtime?.id && chromeApi?.storage?.local;
  const background = inExtension && window.location.pathname === "/background.js";

  if (inExtension) {
    app.settings.extension = true;
    if (document.body) document.body.classList.add("extension");
    else document.addEventListener("DOMContentLoaded", () => document.body?.classList.add("extension"), { once: true });
  }

  if (background) app.settings.background = true;

  if (inExtension) {
    app.on("extensionIcon", async ({ color, text, icon, canvas }) => {
      const { action } = chromeApi;
      if (!action) return;
      if (icon) await action.setIcon({ path: icon });
      if (color) await action.setBadgeBackgroundColor({ color });
      if (text !== undefined) await action.setBadgeText({ text: background && !app.session?.user ? "" : String(text) });
      if (canvas) {
        const context = canvas.getContext("2d");
        await action.setIcon({ imageData: context.getImageData(0, 0, canvas.width, canvas.height) });
      }
    });
  }

  if (background) {
    app.on("logout", () => app.event("extensionIcon", { text: "" }));
    app.on("start", () => {
      // The session client handles restored sessions; cover a first login
      // made through the popup after this worker has already started, too.
      if (!app.session.user)
        app.connection.on("connection", ({ connected }) => {
          if (connected && app.session.user) return app.session.login(app.session.user);
        });
      chromeApi.storage.onChanged.addListener(async (changes, area) => {
        if (area !== "local" || !changes.session) return;
        const stored = changes.session.newValue;
        const user = typeof stored === "string" ? JSON.parse(stored) : stored;
        if (JSON.stringify(user) === JSON.stringify(app.session.user)) return;
        if (user) await app.session.login(user);
        else await app.session.logout();
      });
      if (!app.session.user) app.event("extensionIcon", { text: "" });
    });
  }

  if (!storage()) return;
  console.log("chrome extension storage");

  app.on("init", 500, () => {
    app.storage = app.addeventhandler(
      {
        at: "window.chrome.storage",
        getCollection: app.storage.getCollection,
        setCollection: app.storage.setCollection,
        clearCollection: app.storage.clearCollection,
      },
      ["clear", "getItem", "setItem", "removeItem", "getItemMem", "setItemMem", "removeItemMem", "setItemDebounce"],
      "storage",
    );

    const finish = (resolve, value) => {
      const error = chromeApi?.runtime?.lastError;
      if (error) console.warn("chrome storage", error.message);
      resolve(value);
    };
    const setItem = (key, value) =>
      new Promise((resolve) => {
        const local = storage();
        if (!local) return resolve();
        try {
          local.set({ [key]: value }, () => finish(resolve));
        } catch (error) {
          console.warn("chrome storage set", error.message);
          resolve();
        }
      });
    const getItem = (key) =>
      new Promise((resolve) => {
        const local = storage();
        if (!local) return resolve();
        try {
          local.get([key], (result = {}) => {
            console.log("get", key, result);
            finish(resolve, result[key]);
          });
        } catch (error) {
          console.warn("chrome storage get", error.message);
          resolve();
        }
      });
    const removeItem = (key) =>
      new Promise((resolve) => {
        const local = storage();
        if (!local) return resolve();
        try {
          local.remove([key], () => finish(resolve));
        } catch (error) {
          console.warn("chrome storage remove", error.message);
          resolve();
        }
      });
    const clear = () =>
      new Promise((resolve) => {
        const local = storage();
        if (!local) return resolve();
        try {
          local.clear(() => finish(resolve));
        } catch (error) {
          console.warn("chrome storage clear", error.message);
          resolve();
        }
      });

    app.storage.on("getItem", async (data) => {
      let val = await getItem(data.id);

      if (val === `nystemCache${data.id}`) {
        const nystemCache = await caches.open("nystem");
        val = await nystemCache.match(val).then((req) => req.json());
      }
      return { ...data, value: val && (val[0] === "[" || val[0] === "{") ? JSON.parse(val) : val };
    });

    app.storage.on("setItem", async ({ id, value }) => {
      if (!id) return;

      value = value === undefined || typeof value === "string" ? value : JSON.stringify(value);

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
            headers: new Headers({ "content-type": `application/json`, date: new Date(), etag: "dbdata" }),
          }),
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
      await app.storage.clearCollection();
    });

    const memstore = {};

    app.storage.on("getItemMem", (data) => Object.assign(data, { value: memstore[data.id] }));

    app.storage.on("setItemMem", ({ id, value }) => {
      memstore[id] = value;
    });

    app.storage.on("removeItemMem", ({ id }) => {
      delete memstore[id];
    });
  });
};
