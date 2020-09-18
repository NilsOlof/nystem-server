module.exports = function (app) {
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

  app.storage.on("getItem", (data) => {
    const val = window.localStorage.getItem(data.id);
    return Object.assign(data, {
      value: val && (val[0] === "[" || val[0] === "{") ? JSON.parse(val) : val,
    });
  });

  app.storage.on("setItem", ({ id, value }) => {
    window.localStorage.setItem(
      id,
      typeof value === "string" ? value : JSON.stringify(value)
    );
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

  app.storage.on("getFile", (data) => {});

  app.storage.on("setFile", ({ id, value }) => {});

  app.storage.on("removeFile", ({ id }) => {});
};
