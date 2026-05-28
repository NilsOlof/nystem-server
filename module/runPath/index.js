import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const start = async (app) => {
  const fs = (await import(app.nodePath("fs-extra"))).default;
  const { atHost } = app.settings;

  if (!atHost.runbasepath) return;

  const excludePaths = ["node_modules", "tmp", "yarn.lock"];

  app.on("serverPath", -10, (server) => {
    server.runbasepath = server.basepath.replace(
      atHost.basepath,
      atHost.runbasepath
    );
  });

  await app.event("requireSu.start", { path: `${__dirname}/mksymlink.js` });
  const { data = [] } = await app.database.server.search({ role: "super" });

  (data || []).forEach(async (data) => {
    const server = await app.event("serverPath", data);
    const { basepath, runbasepath } = server;

    if (runbasepath === basepath || !fs.existsSync(basepath)) return;
    if (!fs.existsSync(runbasepath)) fs.ensureDirSync(runbasepath);
    const paths = fs.readdirSync(basepath);

    paths.forEach((path) => {
      if (fs.existsSync(`${runbasepath}/${path}`)) return;
      if (excludePaths.indexOf(path) !== -1) return;

      app.event("mkSymLink", {
        path: `${basepath}/${path}`,
        topath: `${runbasepath}/${path}`,
      });
    });

    if (!fs.existsSync(`${runbasepath}/app.js`)) {
      fs.copy(`${__dirname}/app.js`, `${runbasepath}/app.js`);
      fs.copy(`${app.__dirname}/server.js`, `${basepath}/server.js`);
    }
  });
};

export default (app) => app.on("start", start);
