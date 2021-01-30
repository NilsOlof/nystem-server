module.exports = (app) =>
  app.express.post("/httpsfallback", async (request, response) => {
    let reqData = "";

    request.on("data", (data) => {
      reqData += data;
    });

    request.on("end", async () => {
      const id = app.uuid();

      const timer = setTimeout(() => {
        app.connection.off("emit", emit);
      }, 10000);

      const emit = (data) => {
        if (id !== data.id) return;

        clearTimeout(timer);
        response.end(JSON.stringify(data));
        app.connection.off("emit", emit);
      };
      app.connection.on("emit", emit);

      const event = JSON.parse(reqData);
      app.connection.event(event.type, { ...event, id });
    });
  });
