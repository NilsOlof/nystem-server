import { Agent, createServer } from "node:http";

const getHost = (host = "") => host.toLowerCase().replace(/:\d+$/, "").replace(/\.$/, "");

export default async (ev) => {
  const { routerPort = 80 } = await ev.event("settings");
  const httpProxy = (await import("http-proxy")).default;
  const routes = new Map();

  const remove = (host) => {
    const route = routes.get(host);
    if (!route) return;
    route.agent.destroy();
    route.proxy.close();
    routes.delete(host);
  };

  const proxyServer = createServer((req, res) => {
    const host = getHost(req.headers.host);
    const route = routes.get(host);
    if (route) route.proxy.web(req, res);
    else {
      res.statusCode = host ? 404 : 400;
      res.end(host ? "Missing host " + host : "Missing Host header.");
    }
  });

  proxyServer.on("upgrade", (req, socket, head) => {
    const route = routes.get(getHost(req.headers.host));
    socket.on("error", (error) => {
      if (route) route.proxy.emit("error", error, req, socket);
      else socket.destroy();
    });
    if (route) route.proxy.ws(req, socket, head);
    else socket.end("HTTP/1.1 404 Not Found\r\nConnection: close\r\nContent-Length: 0\r\n\r\n");
  });

  ev.on("router.add", ({ host = [], port, ip = "127.0.0.1" }) => {
    host = (Array.isArray(host) ? host : [host]).filter(Boolean);
    if (!host.length) return;
    port = Number(port);
    ip = ip || "127.0.0.1";
    if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid router upstream port");
    if (port === Number(routerPort) && ["127.0.0.1", "::1", "localhost"].includes(ip))
      throw new Error("Router upstream points back to the router");

    host.forEach((host) => {
      const route = routes.get(getHost(host));
      if (route?.ip === ip && route.port === port) return;
      remove(getHost(host));

      const agent = new Agent({ keepAlive: true, maxSockets: 64, maxFreeSockets: 8 });
      const proxy = httpProxy.createProxyServer({
        target: { host: ip, port },
        agent,
        ws: true,
        xfwd: true,
        proxyTimeout: 30000,
      });
      let lastError = 0;
      let suppressed = 0;
      const proxyError = (error, req, res) => {
        if (Date.now() - lastError >= 5000) {
          console.error("[router] proxy error", {
            host,
            target: ip + ":" + port,
            url: req.url,
            message: error.message,
            code: error.code,
            suppressed,
          });
          lastError = Date.now();
          suppressed = 0;
        } else suppressed++;

        if (!res || res.destroyed || res.writableEnded) return;
        if (!res.writeHead || res.headersSent) res.destroy();
        else {
          res.statusCode = 502;
          res.end("Upstream unavailable.");
        }
      };
      proxy.on("error", proxyError);
      proxy.on("proxyReq", (proxyReq, req, res) => {
        const abort = () => {
          if (!res.writableFinished) proxyReq.destroy();
        };
        res.once("close", abort);
        proxyReq.once("close", () => res.off("close", abort));
      });
      proxy.on("proxyRes", (proxyRes, req, res) => {
        const abort = () => {
          if (!proxyRes.complete) proxyRes.destroy();
        };
        res.once("close", abort);
        proxyRes.once("close", () => res.off("close", abort));
        proxyRes.once("error", (error) => proxyError(error, req, res));
        proxyRes.once("aborted", () => res.destroy());
      });
      proxy.on("proxyReqWs", (proxyReq, req, socket) => {
        const abort = () => proxyReq.destroy();
        socket.once("close", abort);
        proxyReq.setTimeout(30000, () => proxyReq.destroy(new Error("WebSocket upstream timed out")));
        proxyReq.once("upgrade", (proxyRes, proxySocket) => {
          proxyReq.setTimeout(0);
          socket.off("close", abort);
          socket.once("close", () => proxySocket.destroy());
          proxySocket.once("close", () => socket.destroy());
        });
        proxyReq.once("close", () => socket.off("close", abort));
      });
      routes.set(getHost(host), { ip, port, agent, proxy });
      console.log("[router] route added", { host, port, ip });
    });
  });

  ev.on("router.remove", ({ host = [] }) => {
    host = Array.isArray(host) ? host : [host];
    host.forEach((host) => remove(getHost(host)));
  });
  ev.on("router.clear", () => {
    for (const host of routes.keys()) remove(host);
  });

  proxyServer.on("error", (error) => {
    console.error("[router] listen error", { message: error.message, code: error.code });
  });
  await new Promise((resolve, reject) => {
    proxyServer.once("error", reject);
    proxyServer.listen(routerPort, () => {
      proxyServer.off("error", reject);
      console.log("[router] listening", { port: routerPort });
      resolve();
    });
  });
};
