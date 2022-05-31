module.exports = (app) => {
  app.on("start", (app) => {
    const reqs = {};

    app.file.on("post", async ({ id, url = "" }) => {
      if (!url.startsWith("/httpsfallback")) return;
      reqs[id] = "";
    });

    app.file.on("post", async ({ id, data, closed }) => {
      if (reqs[id] === undefined) return;

      if (data) reqs[id] += data.toString();

      if (closed) {
        const reqData = reqs[id];
        delete reqs[id];

        if (reqData === "{}") {
          app.file.event("response", { id, data: "", closed: true });
          return;
        }

        const id = app.uuid();

        const event = JSON.parse(reqData);
        const data = await app.connection.event(event.type, { ...event, id });

        app.file.event("response", {
          id,
          data: JSON.stringify(data),
          closed: true,
        });
      }
    });
  });
};
