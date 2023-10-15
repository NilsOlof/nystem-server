module.exports = (app) => {
  app.on("start", (app) => {
    const clients = {};
    const reqs = {};

    app.file.on("post", async ({ id, url = "" }) => {
      if (!url.startsWith("/httpsfallback")) return;
      reqs[id] = "";
    });

    app.file.on("post", async ({ id, data, closed, headers }) => {
      if (reqs[id] === undefined) return;

      if (headers?.cookie) {
        const requestid = headers.cookie
          .split(";")
          .find((item) => item.includes("requestid="));
        if (requestid)
          // eslint-disable-next-line prefer-destructuring
          clients[id] = requestid.split("=")[1];
      }

      if (data) reqs[id] += data.toString();

      if (closed) {
        const reqData = reqs[id];
        delete reqs[id];

        if (reqData === "{}") {
          app.file.event("response", { id, data: "{}", closed: true });
          return;
        }

        const event = JSON.parse(reqData);
        const headers = {};
        if (event.type === "login") {
          clients[id] = id;
          headers["Set-Cookie"] = `requestid=${id}; HttpOnly`;
        }

        const requestId = clients[id];
        delete clients[id];
        const data = await app.connection.event(event.type, {
          ...event,
          id: requestId,
        });

        app.file.event("response", {
          id,
          headers,
          data: JSON.stringify(data),
          closed: true,
        });
      }
    });
  });
};
