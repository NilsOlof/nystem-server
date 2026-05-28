import { platform } from "node:os";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default (app) => {
  const hostname = platform();
  console.log(`At host ${hostname}`);

  app.on("start", 10, async () => {
    const { data = [] } = await app.database.settings.search({ role: "super" });
    const atHost = {
      ...data.find(
        (setting) => hostname.toLowerCase().indexOf(setting.name) !== -1
      ),
    };

    const { folders = [] } = atHost;
    atHost.folders = folders.reduce(
      (res, folder) => ({ ...res, [folder.id]: folder.path }),
      {}
    );

    app.settings.atHost = {
      ...atHost,
      runbasepath: atHost.runbasepath.replace(/\\/g, "/"),
      basepath: atHost.basepath.replace(/\\/g, "/"),
    };
  });

  app.on("start", async () => {
    console.log("[router] request worker start", { path: `${__dirname}/proxy.js` });
    await app.event("requireSu.start", { path: `${__dirname}/proxy.js` });

    app.database.server.on(["delete", "save"], async (query) => {
      if (query.oldData) {
        console.log("[router] database remove route", query.oldData);
        await app.event("router.remove", query.oldData);
      }
    });
    app.database.server.on("save", async (query) => {
      console.log("[router] database add route", query.data);
      await app.event("router.add", query.data);
    });

    app.database.server
      .search({ role: "super" })
      .then(({ data = [] }) => {
        console.log("[router] load initial routes", { count: data.length });
        data.forEach((server) => {
          console.log("[router] initial route", server);
          app.event("router.add", server);
        });
      });
  });
};
