const fs = require("fs-extra");

const start = (app) => {
  const { atHost } = app.settings;

  if (!atHost.runbasepath) return;

  const excludePaths = ["node_modules", "tmp", "yarn.lock"];

  app.on("runServerPath", -10, (server) => {
    server.runServerPath = server.serverPath.replace(
      atHost.basepath,
      atHost.runbasepath
    );
  });

  app
    .event("requireSu", {
      path: `${__dirname}/mksymlink.js`,
      keys: ["set"],
    })
    .then((doCall) => doCall())
    .then((mksymlink) => {
      app.database.server.search({ role: "super" }).then(({ value = [] }) => {
        value.forEach((data) =>
          app.event("serverPath", data).then((server) => {
            if (server.runServerPath !== server.serverPath) {
              if (!fs.existsSync(server.serverPath)) return;

              if (!fs.existsSync(server.runServerPath))
                fs.ensureDirSync(server.runServerPath);

              const paths = fs.readdirSync(server.serverPath);

              paths.forEach((path) => {
                if (fs.existsSync(`${server.runServerPath}/${path}`)) return;
                if (excludePaths.indexOf(path) !== -1) return;

                mksymlink.set({
                  path: `${server.serverPath}/${path}`,
                  topath: `${server.runServerPath}/${path}`,
                });
              });

              if (!fs.existsSync(`${server.runServerPath}/app.js`)) {
                fs.copy(
                  `${app.__dirname}/app.js`,
                  `${server.runServerPath}/app.js`
                );
                fs.copy(
                  `${app.__dirname}/server.js`,
                  `${server.serverPath}/server.js`
                );
              }
            }
          })
        );
      });
    });
};

module.exports = (app) => app.on("start", start);
