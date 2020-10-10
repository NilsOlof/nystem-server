const fetch = require("node-fetch");

module.exports = async (app) => {
  const { fs } = app;
  const extPath = `${app.__dirname}/files/extension`;
  const host = `http://localhost:${app.settings.port}`;

  const getScripts = (html) => {
    const scriptexp = / (href|src)="([^"]+)\.(js|json)"/gim;
    let match = scriptexp.exec(html);
    const result = [];
    while (match != null) {
      result.push(`${match[2]}.${match[3]}`);
      match = scriptexp.exec(html);
    }
    return result;
  };

  const entrypoints = require("./features.json").filter((item) =>
    ["popup", "background", "content"].includes(item)
  );

  const indexHtml = await fetch(host).then((response) => response.text());

  const files = await Promise.all(
    getScripts(indexHtml)
      .filter((path) => !path.includes("manifest.json"))
      .map(async (path) => ({
        path,
        contents: await fetch(`${host}/${path}`).then((res) => res.buffer()),
      }))
  );

  files.forEach(async ({ path, contents }) => {
    await fs.ensureFile(`${extPath}${path}`);
    fs.writeFile(`${extPath}${path}`, contents);
  });

  const bundle = files.reduce(
    (result, { contents }) => `${result}\n${contents}`,
    ""
  );

  entrypoints.forEach(async (filename) => {
    if (["content"].includes(filename))
      await fs.writeFile(`${extPath}/${filename}.js`, bundle);
    await fs.writeFile(`${extPath}/${filename}.html`, indexHtml);
  });
};
