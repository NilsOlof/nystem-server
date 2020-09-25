module.exports = function (app) {
  if (!app.atHost.setHosts) return false;

  const os = require("os").platform();
  const settings = JSON.parse(
    app.fs.readFileSync(`${__dirname}/settings.json`, "utf8")
  );
  const path = settings[os];
  let hosts = [];
  let suHosts;

  app.on("load", () => {
    app
      .event("requireSu", {
        path: `${__dirname}/suHosts.js`,
        keys: ["set", "get"],
      })
      .then((doCall) => doCall(path))
      .then((fsuhosts) => {
        suHosts = fsuhosts;
        suHosts.get((data) => {
          console.log("Hosts fetched");
          hosts = data.split(/\r\n?/);
          start(suHosts);
        });
      });
  });

  const nodehosts = {};
  const theResthosts = [];

  function start(suHosts) {
    hosts.forEach((host) => {
      if (host.indexOf("#node") !== -1) {
        var oneHost = oneHost.replace(/[ \t]+?#node/, "").split(/[ \t]+/i);
      } else if (host) theResthosts.push(host);
    });

    app.database.host.on("save", (query, queue) => {
      const { oldData } = query;
      if (
        !oldData ||
        query.data.host !== oldData.host ||
        query.data.ip !== oldData.ip
      ) {
        app.event("hosts.remove", oldData);
        app.event("hosts.add", query.data);
      }
    });

    app.on("hosts.add", ({ host, ip }) => {
      host = host instanceof Array ? host : [host];
      ip = ip || "127.0.0.1";
      host.forEach((host) => {
        nodehosts[host] = ip;
      });
      save();
    });

    app.on("hosts.remove", ({ host }) => {
      host = host instanceof Array ? host : [host];
      host.forEach((host) => {
        delete nodehosts[host];
      });
      save();
    });

    app.database.host.on("delete", (query) => {
      app.event("hosts.remove", query.oldData);
    });

    app.database.host.search({ role: "super" }).then(({ value }) => {
      (value || []).forEach((host) => app.event("hosts.add", host));
    });

    app.database.server.search({ role: "super" }).then(({ value }) => {
      (value || []).forEach((host) => app.event("hosts.add", host));
    });

    let saveTimer = false;
    function save() {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(delayedSave, 300);
    }
    function delayedSave() {
      const file = `${theResthosts.join("\r\n")}\r\n${Object.entries(nodehosts)
        .map(([key, value]) => `${value} ${key} #node\r\n`)
        .join("")}`;

      suHosts.set(file);
    }
  }
};
