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
    for (const host of hosts) {
      var oneHost = hosts[host];
      if (oneHost.indexOf("#node") != -1) {
        var oneHost = oneHost.replace(/[ \t]+?#node/, "").split(/[ \t]+/i);
        // nodehosts[oneHost[1]] = oneHost[0];
      } else if (oneHost) theResthosts.push(oneHost);
    }

    app.database.host.on("save", (query, queue) => {
      const { oldData } = query;
      if (
        !oldData ||
        query.data.host != oldData.host ||
        query.data.ip != oldData.ip
      ) {
        app.event("hosts.remove", oldData.host);
        app.event("hosts.add", query.data);
      }
    });

    app.on("hosts.add", ({ host, ip }) => {
      if (!host) return;
      if (!ip) ip = "127.0.0.1";
      if (host instanceof Array)
        for (let i = 0; i < host.length; i++) nodehosts[host[i]] = ip;
      else nodehosts[host] = ip;
      save();
    });

    app.on("hosts.remove", (host) => {
      if (host instanceof Array)
        for (let i = 0; i < host.length; i++) delete nodehosts[host[i]];
      else delete nodehosts[host];
      save();
    });

    app.database.host.on("delete", (query) => {
      app.event("hosts.remove", query.oldData.host);
    });

    app.database.host.getAll().then((hostDb) => {
      hostDb = hostDb.value;
      if (hostDb)
        for (let i = 0; i < hostDb.length; i++)
          app.event("hosts.add", hostDb[i]);
    });

    app.database.server.getAll().then((hostDb) => {
      hostDb = hostDb.value;
      if (hostDb)
        for (let i = 0; i < hostDb.length; i++)
          app.event("hosts.add", hostDb[i]);
    });

    let saveTimer = false;
    function save() {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(delayedSave, 300);
    }
    function delayedSave() {
      let file = `${theResthosts.join("\r\n")}\r\n`;
      for (const host in nodehosts)
        file += `${nodehosts[host]} ${host} #node\r\n`;
      suHosts.set(file);
    }
  }
};
