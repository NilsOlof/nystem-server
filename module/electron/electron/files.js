const { dialog } = require("electron");

const folders = {};

module.exports = async (app) => {
  app.on("electronData", async ({ event, ...rest }) => {
    if (event !== "dialog") return;

    const res = await dialog.showOpenDialog({
      properties: ["openFile", "openDirectory"],
    });

    app.event("electronEvent", { event, ...res, ...rest });
  });

  app.on("electronData", async ({ event, files, path, domain, ...rest }) => {
    if (event !== "syncFiles" || !folders[path]) return;

    // eslint-disable-next-line no-restricted-syntax
    for await (const file of files) {
      const data = await fetch(`${domain}/${file}`);
      await app.fs.writeFile(`${path}/${file}`, data);
    }

    app.event("electronEvent", { event, done: true, ...rest });
  });
};
