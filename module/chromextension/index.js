module.exports = function (app) {
  if (!app.settings.chromextension) return;

  const fetch = require("node-fetch");
  let timer;
  const host = `http://localhost:${app.settings.port}`;
  const extPath = `${app.__dirname}/files/extension`;
  const { fs } = app;

  const getIncludes = (html) => {
    const scriptexp = / (href|src)="([^"]+)\.(js|json|css)"/gim;
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

  const update = async () => {
    console.log("Update extension");
    clearTimeout(timer);

    const indexHtml = await fetch(host).then((response) => response.text());

    const files = await Promise.all(
      getIncludes(indexHtml)
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

  const compileAndCopy = () => {
    update();
    require("./manifest.js")(app);
    [16, 24, 32, 48, 128, 512].forEach((size) => {
      fetch(`${host}/icon/${size}.png`)
        .then((res) => res.buffer())
        .then((buffer) => {
          fs.outputFile(`${extPath}icon/${size}.png`, buffer);
        });
    });
  };

  app.on("start", () => {
    setTimeout(compileAndCopy, 1000);
  });

  if (app.settings.debug)
    app.on("debugModeFileChange", (event) => {
      const parts = event.path.split("/");
      if (!["component", "style", "contentType"].includes(parts[3])) return;

      timer = setTimeout(update, 1000);
    });
};
