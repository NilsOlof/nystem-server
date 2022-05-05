module.exports = (app) => {
  const listners = {};

  app.on("init", async () => {
    window.addEventListener("message", async ({ data }) => {
      if (data.nystem !== "to") return;

      let target = app;
      if (data.path) {
        const parts = data.path.split(".");
        parts.forEach((part) => {
          target = target[part];
        });
      }
      if (data.on) {
        const listnerId = app.uuid();

        const ev = (query) => {
          if (["save", "login"].includes(data.on) && !app.settings.debug)
            return;

          window.postMessage(
            { ...data, listnerId, query, nystem: "from" },
            "*"
          );
        };

        listners[listnerId] = ev;
        target.on(data.on, data.prio || 0, ev);
        target = { listnerId };
      }
      if (data.off) {
        target.off(data.off, listners[data.listnerId]);
        target = data;
      }

      if (data.event) target = await target.event(data.event, data);
      else target = { data: target };

      window.postMessage({ ...data, ...target, nystem: "from" }, "*");
    });

    window.postMessage({ init: true, nystem: "from" }, "*");
  });
};
