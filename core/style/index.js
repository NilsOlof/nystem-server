module.exports = (app) => {
  const load = async (fileName) =>
    JSON.parse(await app.fs.readFile(fileName, "utf8"));

  const cachePath = `${app.__dirname}/files/icons.json`;
  let cached = {};
  app.fs.exists(cachePath).then(async (exist) => {
    if (exist) cached = await load(cachePath);
  });

  app.file.on("get", async ({ id, url = "", type }) => {
    if (!url.startsWith("/geticon/")) return;

    const name = url.split(/[/.]/)[2];

    let data = cached[name];

    if (!data) {
      data = (await load(`${__dirname}/allicons.json`))[name];

      if (data) {
        cached[name] = data;

        setTimeout(() => {
          app.fs.writeFile(cachePath, JSON.stringify(cached));
        }, 1000);
      }
    }
    if (!data) data = "missing";

    app.file.event("response", { id, data, closed: true, type });
    return {};
  });
};
