import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const start = async (app) => {
  const fs = (await import(app.nodePath("fs-extra"))).default;
  const { atHost } = app.settings;

  if (!atHost.runbasepath) return;

  const excludePaths = ["node_modules", "tmp", "yarn.lock"];

  await app.event("requireSu.start", { path: `${__dirname}/mksymlink.js` });
  const syncRunPath = async (data) => {
    const server = await app.event("serverPath", data);
    const { basepath, runbasepath } = server;

    if (
      runbasepath === basepath ||
      (/^\/Users\/[^/]+\/Documents\/nodejs\//.test(runbasepath) &&
        /^\/Users\/[^/]+\/Dropbox\/nodejs\//.test(basepath)) ||
      !fs.existsSync(basepath)
    )
      return;
    if (!fs.existsSync(runbasepath)) fs.ensureDirSync(runbasepath);
    const paths = fs.readdirSync(basepath);

    for (const path of paths) {
      if (fs.existsSync(`${runbasepath}/${path}`) || excludePaths.includes(path)) continue;

      await app.event("mkSymLink", { path: `${basepath}/${path}`, topath: `${runbasepath}/${path}` });
    }
  };

  app.database.server.on("save", -950, async ({ data }) => {
    if (!data) return;
    await syncRunPath(data);
  });

  const { data = [] } = await app.database.server.search({ role: "super" });
  for (const server of data) await syncRunPath(server);
};

export default (app) => app.on("start", start);
