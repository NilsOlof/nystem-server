module.exports = (app) => {
  const load = async (fileName) =>
    JSON.parse(await app.fs.readFile(fileName, "utf8"));

  const cachePath = `${app.__dirname}/files/icons.json`;
  let cached = {};
  app.fs.exists(cachePath).then(async (exist) => {
    if (exist) cached = await load(cachePath);
  });

  app.express.get("/geticon/*", async (req, res) => {
    const name = req.params[0].split(/[/.]/)[0];

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

    res.setHeader("content-type", "text/plain");
    res.end(data || "missing");
  });
};
