import * as http from "node:http";

const devStartingIfno = `
<!doctype html>
<html lang="en">
  <head>
    <script>
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    </script>
    </head>
  <body><h1>Dev environment starting...</h1></body>
</html>
`;

const getRelReplace = (dirname) =>
  new RegExp(`(${dirname.replace(/\\/g, "/")})/web/src/`, "gi");

export default async (app) => {
  const rewrite = (url, data) => {
    if (url.startsWith("/node_modules/.vite/deps/chunk-"))
      return data
        .toString()
        .replace('console.info("%cDownload', 'const a = ()=>{}; a("%cDownload');

    if (/\.js\.map$/im.test(url))
      return data.toString().replace(getRelReplace(app.__dirname), "$1/");

    return data;
  };

  app.on("start", async () => {
    const port = app.settings.port + 5000;
    if (app.fs.existsSync(`${app.__dirname}/web`)) {
      await app.require("./htmlFolder");
      await app.require("./manifest");
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
          headers: { ...headers, host: `localhost:${port}` },
        },
        (response) => {
          const { headers, statusMessage, statusCode } = response;
          delete headers["Content-length"];
          delete headers["accept-encoding"];
          headers["Access-Control-Allow-Origin"] = "*";

          if (statusCode === 500) {
            app.file.event("response", {
              id,
              type,
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
            type,
            headers,
            statusMessage,
            statusCode,
            url,
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
        },
      );

      resp.on("error", (error) => {
        if (error.code === "ECONNREFUSED") {
          console.log("Client not found, starting dev server...");
          startApp();
        } else
          console.log(
            `💥 Res error ${error.stack.toString().replace(/\n/g, "")}`,
          );

        app.file.event("response", {
          id,
          type,
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
  const startApp = async () => {
    if (started) return;
    started = true;

    const { spawn } = await import("node:child_process");
    const { platform } = await import("node:os");

    const isWin = platform() === "win32";

    const command = isWin ? "cmd" : "osascript";
    const args = isWin
      ? ["start"]
      : [
          "-e",
          `tell application "Terminal" to do script "cd ${app.__dirname}/web && npm start"`,
        ];

    const opt = {
      cwd: `${app.__dirname}/web`,
      env: process.env,
      stdio: "inherit",
      shell: isWin, // Required on Windows to resolve 'cmd' and '.cmd' files
    };

    const ex = spawn(command, args, opt);

    ex.on("error", (err) => console.error("Failed to start process:", err));

    app.on("exit", () => ex.kill());
  };
};
