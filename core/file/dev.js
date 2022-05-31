const http = require("http");

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

const getRelReplace = (dirname) =>
  new RegExp(`(${dirname.replace(/\\/g, "/")})/web/src/`, "gi");

module.exports = (app) => {
  const rewrite = (url, data) => {
    if (/\.js\.map$/im.test(url))
      return data.toString().replace(getRelReplace(app.__dirname), "$1/");

    if (/bundle\.js$/im.test(url))
      return data
        .toString()
        .replace("console.info('%cDownload", "const a = ()=>{}; a('%cDownload");

    return data;
  };

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

    app.file.on("get", -1000, async (query) => {
      const { id, url = "", type, headers } = query;
      if (!url) return;
      delete headers["accept-encoding"];

      const resp = http.request(
        {
          hostname: "127.0.0.1",
          port: app.settings.port + 5000,
          path: url,
          method: "GET",
          headers: { ...headers, host: "underproduktion.localhost:13065" },
        },
        (response) => {
          const { headers, statusMessage, statusCode } = response;
          delete headers["Content-length"];
          delete headers["accept-encoding"];

          if (statusCode === 500) {
            app.file.event("response", {
              id,
              headers,
              data: "File not found",
              statusMessage,
              statusCode,
              closed: true,
            });

            return;
          }

          app.file.event("response", {
            id,
            headers,
            statusMessage,
            statusCode,
          });

          response.on("end", () => {
            app.file.event("response", { id, closed: true });
          });
          response.on("data", (data) => {
            app.file.event("response", { id, data: rewrite(url, data) });
          });

          response.on("error", (error) => {
            console.log("error", error);
            app.file.event("response", { id, close: true });
          });
        }
      );

      resp.on("error", (error) => {
        console.log(
          `💥 Res error ${error.stack.toString().replace(/\n/g, "")}`
        );
        if (error.code === "ECONNREFUSED") startApp();

        app.file.event("response", {
          id,
          data: devStartingIfno,
          statusMessage: "OK",
          statusCode: 404,
          closed: true,
        });
      });

      resp.end();
      return {};
    });
  });

  let started = false;
  function startApp() {
    if (started) return;
    started = true;

    const { spawn } = require("child_process");
    const os = require("os");
    const args =
      os.platform() === "win32"
        ? ["start"]
        : [
            "-e",
            `tell app "Terminal" to do script "cd ${app.__dirname}/web && npm start"`,
          ];

    const opt = {
      cwd: `${app.__dirname}/web`,
      env: process.env,
      stdio: [process.stdin, process.stdout, process.stderr],
      detached: false,
    };

    const command =
      os.platform() === "win32" ? `${__dirname}/openReactApp.cmd` : "osascript";

    const ex = spawn(command, args, opt);
    app.on("exit", () => ex.kill());
  }
};
