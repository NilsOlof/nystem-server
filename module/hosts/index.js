const start = async (app) => {
  if (!app.atHost.setHosts) return false;
  await app.event("requireSu.start", { path: `${__dirname}/hosts.js` });

  const nodehosts = {};

  const { data: hosts } = await app.event("hosts.get");

  const theResthosts = hosts
    .split(/\r\n/)
    .filter((row) => row)
    .filter((row) => row.indexOf(".adobe.") === -1)
    .filter((row) => row.indexOf("#node") === -1);

  console.log(theResthosts);
  return;
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
    console.log({ file });
    // suHosts.set(file);
  }
};

module.exports = (app) => app.on("start", start);
