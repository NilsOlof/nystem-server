import { platform } from "node:os";
import proxy from "./proxy.js";

export default (app) => {
  const hostname = platform();
  console.log(`At host ${hostname}`);

  app.on("start", 10, async () => {
    const { data = [] } = await app.database.settings.search({ role: "super" });
    const atHost = { ...data.find((setting) => hostname.toLowerCase().indexOf(setting.name) !== -1) };

    const { folders = [] } = atHost;
    atHost.folders = folders.reduce((res, folder) => ({ ...res, [folder.id]: folder.path }), {});

    app.settings.atHost = {
      ...atHost,
      runbasepath: atHost.runbasepath.replace(/\\/g, "/"),
      basepath: atHost.basepath.replace(/\\/g, "/"),
    };
  });

  app.on("start", async () => {
    await proxy(app);

    app.database.server.on("delete", async (query) => {
      if (query.oldData) {
        await app.event("router.remove", query.oldData);
      }
    });
    app.database.server.on("save", async (query) => {
      if (query.oldData?.host) {
        const host = Array.isArray(query.data.host) ? query.data.host : [query.data.host];
        await app.event("router.remove", {
          host: (Array.isArray(query.oldData.host) ? query.oldData.host : [query.oldData.host]).filter(
            (item) => !host.includes(item),
          ),
        });
      }
      await app.event("router.add", query.data);
    });

    const { data = [] } = await app.database.server.search({ role: "super" });
    for (const server of data) await app.event("router.add", server);
  });
};
