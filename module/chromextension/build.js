const fetch = require("node-fetch");

module.exports = async (app) => {
  const { fs } = app;
  const extPath = `${__dirname}/extension/`;
  const host = `http://localhost:${app.settings.port}`;

  const getScripts = (html) => {
    const scriptexp = /<script src="([^"]+)"><\/script>/gim;
    let match = scriptexp.exec(html);
    const result = [];
    while (match != null) {
      result.push(match[1]);
      match = scriptexp.exec(html);
    }
    return result;
  };

  const entrypoints = require("./entrypointsArr.json");

  const indexHtml = await fetch(host);

  const files = await Promise.all(
    getScripts(indexHtml).map(async (path) => ({
      path,
      contents: await fetch(`${host}/${path}`),
    }))
  );

  files.forEach(({ path, contents }) =>
    fs.writeFile(`${extPath}${path}`, contents)
  );
  const bundle = files.reduce(
    (result, { contents }) => `${result}\n${contents}`,
    ""
  );

  // ["popup", "background", "content"]

  entrypoints.forEach(async (filename) => {
    if (["content"].includes(filename))
      await fs.writeFile(`${extPath}${filename}.js`, bundle);
    await fs.writeFile(`${extPath}${filename}.html`, indexHtml);
  });
};
