import { createServer } from "node:http";

export default async (ev) => {
  const { routerPort } = await ev.event("settings");
  console.log("[router] proxy start", { routerPort: routerPort || 80 });

  let routes = {};
  const httpProxy = (
    await import(`file://${process.env.NODE_PATH}/http-proxy/index.js`)
  ).default;
  let proxy = {};

  function loadConfig() {
    const proxyOld = proxy;
    proxy = {};
    Object.entries(routes).forEach(([item]) => {
      if (proxyOld[item]) proxy[item] = proxyOld[item];
      else {
        const [host, port] = routes[item].split(":");
        console.log("[router] create proxy", { host: item, target: routes[item] });
        proxy[item] = httpProxy.createProxyServer({
          target: {
            host,
            port,
          },
          ws: true,
          xfwd: true,
        });
        proxy[item].on("error", (err, req, res) => {
          console.log("[router] proxy error", {
            host: req?.headers?.host,
            url: req?.url,
            message: err.message,
            code: err.code,
          });
          if (res?.writeHead) {
            res.statusCode = 500;
            res.end("Response error.");
          }
        });
      }
    });
    console.log("[router] routes loaded", routes);
  }

  const getHost = ({ headers }) => {
    const { host } = headers;
    return host.indexOf(":") !== -1
      ? host.substring(0, host.indexOf(":"))
      : host;
  };

  const proxyServer = createServer((req, res) => {
    const host = getHost(req);

    console.log("[router] http request", {
      host,
      url: req.url,
      hasRoute: Boolean(proxy[host]),
    });

    if (proxy[host])
      proxy[host].web(req, res, (err) => {
        if (err)
          console.log("[router] web callback error", {
            host,
            url: req.url,
            message: err.message,
            code: err.code,
          });
      });
    else {
      console.log("[router] missing host", { host, routes });
      res.end(`Missing host ${host}`);
    }
  });

  proxyServer.on("upgrade", (req, socket, head) => {
    const host = getHost(req);
    console.log("[router] websocket upgrade", {
      host,
      url: req.url,
      hasRoute: Boolean(proxy[host]),
    });

    socket.on("error", (err, req, res) => {
      console.log("[router] socket error", { message: err.message, code: err.code });
    });
    if (proxy[host]) proxy[host].ws(req, socket, head);
    else console.log("[router] missing websocket host", { host, routes });
  });

  proxyServer.listen(routerPort || 80, () => {
    console.log("[router] listening", { port: routerPort || 80 });
  });

  proxyServer.on("error", (e) => {
    console.log("[router] listen error", { message: e.message, code: e.code });
  });

  console.log("[router] started");

  ev.on("router.add", ({ host = [], port, ip }) => {
    host = host instanceof Array ? host : [host];
    ip = ip || "127.0.0.1";
    console.log("[router] add", { host, port, ip });

    host.forEach((host) => {
      if (!host) {
        console.log("[router] skip empty host", { port, ip });
        return;
      }
      routes[host] = `${ip}:${port}`;
    });

    loadConfig();
  });

  ev.on("router.remove", ({ host }) => {
    host = host instanceof Array ? host : [host];
    console.log("[router] remove", { host });
    host.forEach((host) => {
      delete routes[host];
    });
    loadConfig();
  });

  ev.on("router.clear", () => {
    console.log("[router] clear");
    routes = {};
    loadConfig();
  });
};
