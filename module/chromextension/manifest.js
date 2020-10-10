module.exports = async (app) => {
  const { fs } = app;

  const getPart = (path) =>
    fs.readFile(`${__dirname}/manifest/${path}.json`, "utf-8");

  const parts = await Promise.all(
    ["base", ...require("./features.json")].map(async (path) =>
      JSON.parse(await getPart(path))
    )
  );

  const mergeKey = (d1, d2) => {
    if (d1 instanceof Array && d2 instanceof Array)
      return [...new Set([...d1, ...d2])];

    if (typeof d1 === "object" && typeof d2 === "object") {
      const commonkeys = Object.keys(d1).filter(
        Set.prototype.has,
        new Set(Object.keys(d2))
      );

      return Object.assign(
        d1,
        d2,
        ...commonkeys.map((key) => ({
          [key]: mergeKey(d1[key], d2[key]),
        }))
      );
    }

    return d2;
  };

  fs.writeFile(
    `${app.__dirname}/files/extension/manifest.json`,
    JSON.stringify(parts.reduce(mergeKey, {}), null, "  ").replace(
      /"\{name\}"/g,
      `"${app.settings.client.name}"`
    )
  );
};
