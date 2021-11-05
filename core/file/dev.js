const devStartingIfno = `
<!doctype html>
<html lang="en">
  <head>
    <script>
      setTimeout(() => {
        window.location.reload();
      }, 7000);
    </script>
    </head>
  <body><h1>Dev environment starting...</h1></body>
</html>
`;

module.exports = (app) => {
  app.on("start", () => {
    const port = app.settings.port + 5000;
    if (app.fs.existsSync(`${app.__dirname}/web`)) {
      require("./htmlFolder")(app);
      require("./manifest")(app);

      app.writeFileChanged(
        `${app.__dirname}/web/.env`,
        `BROWSER=none\nSKIP_PREFLIGHT_CHECK=true\nINLINE_RUNTIME_CHUNK=false\nDOMAIN=localhost:${port}\nESLINT_NO_DEV_ERRORS=true\nFAST_REFRESH=false\nPORT=${port}\nWDS_SOCKET_PORT=${port}\n`
      );
    }

    const http = require("http");
    const httpProxy = require("http-proxy");

    const proxy = httpProxy.createProxyServer({
      target: `http://localhost:${port}`,
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
        res.writeHead = (statusCode, headers) => {
          res.removeHeader("Content-length");
          _writeHead.call(res, statusCode, headers);
        };
      }

      proxy.web(req, res, (error) => {
        if (error) {
          console.log("res.get", error);
          if (error.code === "ECONNREFUSED") startApp();
          res.end(devStartingIfno);
        }
      });
    });
    app.express.post("/*", (req, res) => {
      proxy.web(req, res, (error) => {
        console.log("res.post", error);
        res.end("res.post error", error);
      });
    });
  });

  let started = false;
  const startApp = () => {
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
    // require("child_process").exec(`open -a Terminal "${runbasepath}"`);

    const command =
      os.platform() === "win32"
        ? `${__dirname}/openReactApp.cmd`
        : `osascript -e 'tell app "Terminal" to do script "cd ${app.__dirname}/web && npm start"'`;

    const ex = spawn(command, args, opt);
    app.on("exit", () => ex.kill());
  };
};
