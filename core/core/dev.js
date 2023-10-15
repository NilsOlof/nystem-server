const replaceRequire = (content) =>
  content.replace(
    /const ([a-z]+)M = require\(".\/\1"\);$/gim,
    'import $1M from "./$1";'
  );

const replaceExports = (content) => {
  return content.replace(/module.exports = /gim, "export default ");
};

module.exports = (app) => {
  if (!app.fs.existsSync(`${app.__dirname}/web`)) return;
  require("./debug/debug")(app);
  require("./debug/debugEvLog")(app);

  const { fs } = app;

  function clientScriptIndex() {
    const scripts = app.filePaths
      .map((path) => {
        const pathpart = path.split("/");
        if (
          pathpart.length !== 4 ||
          pathpart[2] !== "client" ||
          pathpart[3] !== "index.js"
        )
          return false;

        return {
          module: pathpart[1],
          path: `/${path}`,
        };
      })
      .filter((path) => path !== false);

    const imports = scripts.reduce(
      (prev, out) => `${prev}import ${out.module} from '.${out.path}';\n`,
      ""
    );
    const calls = scripts.reduce((prev, out) => {
      return `${prev}  ${out.module}(app);\n`;
    }, "");

    app.writeFileChanged(
      `${app.__dirname}/web/src/indexScripts.js`,
      `${imports}\nexport default function(app) {\n${calls}}\n`
    );
  }

  app.on("start", () => {
    const settings = { debug: app.settings.debug, ...app.settings.client };

    function saveSettings() {
      app.writeFileChanged(
        `${app.__dirname}/web/src/settings.json`,
        JSON.stringify(settings, null, "  ")
      );
    }
    saveSettings();

    app.writeFileChanged(
      `${app.__dirname}/web/src/index.js`,
      fs.readFile(`${__dirname}/client/entry.js`)
    );

    const readAndCopy = (path) =>
      app.writeFileChanged(
        `${app.__dirname}/web/src/${path}`,
        fs
          .readFile(`${app.__dirname}/${path}`, "utf8")
          .then(replaceExports)
          .then(replaceRequire)
      );

    app.on("debugModeFileChange", ({ path, type }) => {
      const pathSplit = path.split("/");
      if (pathSplit[3] !== "client") return;
      readAndCopy(path);
    });

    const updateFiles = async () => {
      const htmlFiles = app.filePaths.filter(
        (path) => path.split("/")[2] === "client"
      );
      for (const path of htmlFiles) await readAndCopy(path);
    };
    updateFiles();

    clientScriptIndex();
  });
};
