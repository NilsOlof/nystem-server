module.exports = (app) => {
  app.on("init", () => {
    window.addEventListener("message", async ({ data }) => {
      if (data.nystem !== "to") return;

      const parts = data.path.split(".");
      let target = app;
      parts.forEach((part) => {
        target = target[part];
      });

      if (data.event) target = await target.event(data);
      else target = { data: target };

      window.postMessage({ ...data, ...target, nystem: "from" }, "*");
    });

    window.postMessage({ init: true, nystem: "from" }, "*");
  });
};
