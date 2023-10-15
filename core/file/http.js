const mime = require("mime");

module.exports = (app) => {
  app.file.on(["get", "post"], 1000, (query) => {
    const { res, req, socket } = query;
    if (!res && !socket) return;

    const { url } = req;
    let path = url === "/" ? "/index" : url;

    let type;
    if (path.indexOf("?") !== -1)
      type = mime.getType(path.substring(0, path.indexOf("?")));
    else type = mime.getType(path);
    type = type || "text/html";

    if (type === "application/octet-stream") {
      type = "text/html";
      path += ".html";
    }

    const { headers } = req;

    return {
      ...query,
      url,
      isSocket: !!socket,
      headers,
      type,
      path,
    };
  });

  app.file.on("post", 900, ({ id, req }) => {
    if (!req) return;

    req.on("data", (data) => {
      app.file.event("post", { id, data });
    });
    req.on("end", () => {
      app.file.event("post", { id, closed: true });
    });
    req.on("abort", () => {
      app.file.event("post", { id, abort: true });
    });
  });

  const responses = {};

  app.file.on(["get", "post", "head"], 990, ({ id, res, type }) => {
    if (!res) return;

    responses[id] = { res, type };

    res.on("abort", () => {
      delete responses[id];
      res.destroy();
      app.file.event("response", { id, abort: true });
    });
    res.on("close", () => {
      delete responses[id];
      res.destroy();
      app.file.event("response", { id, close: true });
    });
  });

  const cacheTimeStart = new Date();

  if (!app.settings.debug)
    app.file.on("get", 990, ({ id, headers = {}, etag, type }) => {
      if (
        !etag ||
        headers["if-none-match"] !== `hepp--${cacheTimeStart.getTime()}`
      )
        return;

      app.file.event("response", {
        id,
        headers: { "Content-Type": type },
        statusCode: 304,
        closed: true,
      });

      return {};
    });

  app.file.on("response", 10, (query) => {
    const { id, headers, closed, type } = query;
    if (closed === true && !responses[id]) {
      console.log("Double response", query);
      return;
    }

    if (closed === true && !headers && !responses[id].res.headersSent && type)
      return { ...query, headers: { "Content-Type": type } };
  });

  const time = app.settings.debug ? 0 : 1000;
  app.file.on("response", -90, ({ headers, ...rest }) => {
    if (!headers) return;

    headers = {
      Expires: new Date(Date.now() + 1000).toUTCString(),
      "Cache-Control": `max-age=${time}, must-revalidate`,

      ETag: `hepp--${cacheTimeStart.getTime()}`,
      "Last-Modified": cacheTimeStart,
      ...headers,
    };
    if (!headers.ETag) delete headers.ETag;

    return { ...rest, headers };
  });

  const zlib = require("zlib");
  const compressData = (data) =>
    new Promise((resolve) => {
      const buffer = data instanceof Buffer ? data : Buffer.from(data);
      zlib.gzip(buffer, (err, result) => resolve(result));
    });

  const compresses = {};
  app.file.on("get", 900, ({ id, headers, type }) => {
    if (
      headers &&
      headers["accept-encoding"] &&
      (type.includes("text") ||
        type === "application/json" ||
        type === "image/svg+xml" ||
        type === "application/javascript") &&
      headers["accept-encoding"].match(/\bgzip\b/)
    )
      compresses[id] = true;
  });

  app.file.on("response", -90, ({ id, headers }) => {
    if (!headers || !compresses[id]) return;

    headers["content-encoding"] = "gzip";
    delete headers["content-length"];
  });

  app.file.on("response", -200, async ({ closed, data, ...query }) => {
    const { id } = query;

    if (!compresses[id]) return;

    if (data) {
      data = data.toString();
      compresses[id] = compresses[id] === true ? data : compresses[id] + data;
    }

    if (!closed) return query;
    if (compresses[id] !== true) data = await compressData(compresses[id]);
    delete compresses[id];

    return { closed, data, ...query };
  });

  app.file.on(
    "response",
    -100,
    ({ id, headers, statusMessage, statusCode }) => {
      if (!responses[id] || !headers || responses[id].res.headersSent) return;

      Object.keys(headers).forEach((key) =>
        responses[id].res.setHeader(String(key).trim(), headers[key])
      );

      if (statusMessage) responses[id].res.writeHead(statusCode, statusMessage);
      else responses[id].res.writeHead(statusCode || 200);
    }
  );

  app.file.on("response", -1000, ({ id, data, closed, abort }) => {
    if (!responses[id]) return;

    if (data) responses[id].res.write(data);
    if (closed) responses[id].res.end();
    if (abort) responses[id].res.abort();
  });
};
