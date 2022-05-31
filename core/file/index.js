const http = require("http");

module.exports = (app) => {
  app.file = app.addeventhandler();

  require("./logToFile")(app);
  require("./http")(app);

  // Clear all caches
  app.file.on("/clearcache", (req, res) => {
    app.cacheTimeStart = new Date();
    app.event("clearcache");
    res.end("Done");
  });

  const { fs } = app;

  app.on("start", 100, () => {
    if (app.settings.port) {
      const server = http.createServer((req, res) => {
        const method = req.method.toLowerCase();

        app.file.event(method, {
          req,
          res,
          id: app.uuid(),
          method,
        });
      });

      server.on("upgrade", (req, socket, head) => {
        app.file.event("socket", { req, socket, head, id: app.uuid() });
      });

      server.listen(app.settings.port, app.settings.host);
    }

    app.file.on("get", -10, async ({ id, url, type }) => {
      if (!url?.startsWith("/image/")) return;

      const parts = url.split("/");
      const fullPath = `${app.__dirname}/files/image/original/${
        parts[parts.length - 1]
      }`;

      app.file.event("pipeFile", { id, type, fullPath });
      return {};
    });
  });

  app.file.on("pipeFile", ({ fullPath, id, secure, type }) => {
    app.file.event("response", {
      id,
      headers: {
        "content-type": type,
        "Cache-Control": `max-age=${secure ? 0 : 31536000}`,
      },
    });

    if (!fullPath) {
      app.file.event("response", { id, closed: true });
      return;
    }

    const fileStream = fs.createReadStream(fullPath);
    fileStream.on("error", (err) => {
      console.log(err);
    });

    fileStream.on("data", (data) => {
      app.file.event("response", { id, data });
    });
    fileStream.on("end", () => {
      app.file.event("response", { id, closed: true });
    });
  });
};
