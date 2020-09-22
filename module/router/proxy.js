module.exports = (routerPort) => {
  console.log("Proxy start");

  let routes = {};
  const httpProxy = require("http-proxy");
  let proxy = {};

  function loadConfig() {
    const proxyOld = proxy;
    proxy = {};
    Object.entries(routes).forEach(([item]) => {
      if (proxyOld[item]) proxy[item] = proxyOld[item];
      else {
        proxy[item] = httpProxy.createProxyServer({
          target: {
            host: routes[item].split(":")[0],
            port: routes[item].split(":")[1],
          },
          ws: true,
          xfwd: true,
        });
        proxy[item].on("error", (err, req, res) => {
          res.statusCode = 500;
          res.end("Response error.");
        });
      }
    });
  }

  const getHost = ({ headers }) => {
    const { host } = headers;
    return host.indexOf(":") !== -1
      ? host.substring(0, host.indexOf(":"))
      : host;
  };

  const proxyServer = require("http").createServer((req, res) => {
    const host = getHost(req);

    if (proxy[host]) proxy[host].web(req, res, (err) => {});
    else res.end(`Missing host ${host}`);
  });

  proxyServer.on("upgrade", (req, socket, head) => {
    const host = getHost(req);

    socket.on("error", (err, req, res) => {
      console.log("Error");
    });
    if (proxy[host]) proxy[host].ws(req, socket, head);
  });

  proxyServer.listen(routerPort || 8080);

  proxyServer.on("error", (e) => {
    // Handle your error here
    console.log(e);
  });

  console.log("Started router");

  return {
    add: function (host = [], port, ip) {
      host = host instanceof Array ? host : [host];
      ip = ip || "127.0.0.1";

      host.forEach((host) => {
        routes[host] = `${ip}:${port}`;
      });

      loadConfig();
    },
    remove: function (host) {
      host = host instanceof Array ? host : [host];
      host.forEach((host) => {
        delete routes[host];
      });
      loadConfig();
    },
    clear: function () {
      routes = {};
      loadConfig();
    },
  };
};
