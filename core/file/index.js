module.exports = function (app) {
  // Clear all caches
  app.express.get("/clearcache", (req, res) => {
    app.cacheTimeStart = new Date();
    app.event("clearcache");
    res.end("Done");
  });

  const { fs } = app;
  const stream = require("stream");
  const zlib = require("zlib");

  // Return not updated (304) if cache not cleared and not debug
  // otherwise return false and process request
  app.isCached = function (type, req, res, debug) {
    const age = debug ? 1 : 180;
    res.setHeader("Cache-Control", `max-age=${age}, must-revalidate`);
    res.setHeader("Expires", new Date(Date.now() + age * 1000).toUTCString());
    const etag = `hepp--${app.cacheTimeStart.getTime()}`;
    if (!debug && req && req.headers["if-none-match"] === etag) {
      res.setHeader("Content-Type", type);
      res.statusCode = 304;
      res.end();
      return true;
    }
    res.setHeader("Last-Modified", app.cacheTimeStart);
    res.setHeader("ETag", etag);
    res.setHeader("Content-Type", type);
    res.statusCode = 200;
    return false;
  };

  // Gzip the response
  app.compressRes = function compressRes(data, req, res) {
    if (app.atHost.debug) {
      res.end(data);
      return;
    }
    let acceptEncoding = req.headers["accept-encoding"];
    const s = new stream.Readable();
    s._read = function () {
      if (sent) this.push(null);
      else this.push(data);
      sent = true;
    };
    let sent = false;
    if (!acceptEncoding) acceptEncoding = "";
    if (acceptEncoding.match(/\bgzip\b/)) {
      res.writeHead(200, { "content-encoding": "gzip" });
      s.pipe(zlib.createGzip()).pipe(res);
    } else if (acceptEncoding.match(/\bdeflate\b/)) {
      res.writeHead(200, { "content-encoding": "deflate" });
      s.pipe(zlib.createDeflate()).pipe(res);
    } else {
      res.writeHead(200, {});
      res.end(data);
    }
  };

  let pipeFileCache = {};
  // Stream file
  app.pipeFile = function (path, res) {
    if (!fs.existsSync(`${app.__dirname}/${path}`)) return false;
    if (!app.atHost.debug) {
      if (!pipeFileCache[path])
        pipeFileCache[path] = fs.readFileSync(`${app.__dirname}/${path}`);
      res.end(pipeFileCache[path]);
      return true;
    }
    const fileStream = fs.createReadStream(`${app.__dirname}/${path}`);
    fileStream.on("error", (err) => {
      console.log(err.errno);
    });
    fileStream.on("data", (data) => {
      res.write(data);
    });
    fileStream.on("end", () => {
      res.end();
    });
    return true;
  };

  app.on("clearcache", () => {
    pipeFileCache = {};
  });

  app.on("start", 100, () => {
    app.express.get("/image/*", (req, res) => {
      const type = require("mime").getType(req.params[0]);
      res.setHeader("Content-Type", type);
      res.setHeader("Cache-Control", "max-age=31536000");
      app.pipeFile(
        `files/image/original/${req.params[0].replace(/\.\.\//g, "")}`,
        res
      );
    });
  });
};
