module.exports = function (app) {
  app.on("start", () => {
    if (!app.fs.existsSync(`${app.__dirname}/web`)) return;

    app.writeFileChanged(
      `${app.__dirname}/web/.env`,
      `BROWSER=none\nSKIP_PREFLIGHT_CHECK=true\nDOMAIN=localhost:${
        app.settings.port + 5000
      }\nPORT=${app.settings.port + 5000}\n`
    );

    const readAndCopy = async (path) => {
      const destPath = path.split("/").slice(3).join("/");
      const dest = `${app.__dirname}/web/public/${destPath}`;
      const src = `${app.__dirname}/${path}`;

      await app.writeFileChanged(dest, app.readFile(src));
    };

    const updateFiles = async () => {
      const htmlFiles = app.filePaths.filter(
        (path) => path.split("/")[2] === "html"
      );
      for (const path of htmlFiles) await readAndCopy(path);
    };
    updateFiles();

    app.on("debugModeFileChange", ({ path, type }) => {
      const pathSplit = path.split("/");
      if (pathSplit[3] !== "html") return;

      readAndCopy(path.slice(1));
    });

    const http = require("http");
    const httpProxy = require("http-proxy");

    const proxy = httpProxy.createProxyServer({
      target: `http://localhost:${app.settings.port + 5000}`,
      ws: true,
      xfwd: true,
      agent: new http.Agent({ maxSockets: Number.MAX_VALUE }),
    });

    const getRelReplace = (dirname) =>
      new RegExp(`(${dirname.replace(/\\/g, "/")})/web/src/`, "gi");

    app.server.on("upgrade", (req, socket, head) => {
      if (req.url !== "/") proxy.ws(req, socket, head);
    });

    app.express.get("/*", (req, res) => {
      if (/\.js\.map$/im.test(req.url)) {
        delete req.headers["accept-encoding"];
        const _write = res.write;
        res.write = (data) => {
          _write.call(
            res,
            data.toString().replace(getRelReplace(app.__dirname), "$1/")
          );
        };

        const _writeHead = res.writeHead;
        res.writeHead = function (statusCode, headers) {
          res.removeHeader("Content-length");
          _writeHead.call(res, statusCode, headers);
        };
      }

      proxy.web(req, res, (error) => {
        if (error) {
          console.log("res.get", error);
          if (error.code === "ECONNREFUSED") startApp();
          res.end("Dev environment starting");
        }
      });
    });
    app.express.post("/*", (req, res) => {
      proxy.web(req, res, (error) => {
        console.log("res.post", error);
        res.end("Dev environment starting");
      });
    });
  });

  let started = false;
  function startApp() {
    if (started) return;
    started = true;
    const { spawn } = require("child_process");
    const os = require("os");
    const args = ["start"];

    const opt = {
      cwd: `${app.__dirname}/web`,
      env: process.env,
      stdio: [process.stdin, process.stdout, process.stderr],
      detached: false,
    };

    spawn(os.platform() === "win32" ? "npm.cmd" : "npm", args, opt);
  }
};
