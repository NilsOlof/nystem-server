module.exports = (app) => {
  const { fs } = app;
  // Load and and merge contentypes into one JSON
  app.on("getContentTypes", () => {
    console.log("getContentTypes");
    const out =
      app.atHost.noContentTypeClear && app.contentType ? app.contentType : {};

    function file2Type(file, depthLimit, filename, parent) {
      if (fs.statSync(file).isDirectory()) {
        if (!depthLimit) return;
        const files = fs.readdirSync(file);
        for (let i = 0; i < files.length; i++)
          file2Type(`${file}/${files[i]}`, depthLimit - 1, files[i], filename);
      } else if (
        parent === "contentType" &&
        file.indexOf(".json") !== -1 &&
        file.indexOf("component/contentType/definition.json") === -1
      ) {
        try {
          out[filename.replace(".json", "")] = JSON.parse(
            fs.readFileSync(file, "utf8")
          );
        } catch (e) {
          console.log("Parse error", file);
        }
      }
    }

    file2Type(`${app.__dirname}/core`, 3);
    file2Type(`${app.__dirname}/module`, 3);

    return out;
  });

  const saveContentTypes = () =>
    new Promise((resolve, reject) =>
      app.event("getContentTypes").then((contentTypes) => {
        app.contentType = contentTypes;
        resolve();
        if (!app.fs.existsSync(`${app.__dirname}/web`)) return;

        const path = `${app.__dirname}/web/src/contentype.json`;
        app.writeFileChanged(path, JSON.stringify(app.contentType));
      })
    );

  app.on("debugModeUpdateOnChange", (update) => {
    if (update.event !== "contentTypeChange") return;
    saveContentTypes();
  });

  app.on("init", saveContentTypes, 1000);

  const isComponentFormat =
    /(core|module)\/[^/]+\/component\/([^/]+)\/([^/]+)\.json/im;
  app.on("getComponentDefinitions", () =>
    app.filePaths
      .map((path) => ({
        match: path.match(isComponentFormat),
        path,
      }))
      .filter((path) => path.match)
      .map((component) => {
        try {
          const content = JSON.parse(
            fs.readFileSync(`${app.__dirname}/${component.path}`, "utf8")
          );
          return { ...component, content };
        } catch (e) {
          console.log(`No content in ${app.__dirname}/${component.path}`);
        }
      })
      .reduce((result, component) => {
        const [, , compName, format] = component.match;
        result[`${compName}${app.capFirst(format)}`] = component.content;
        return result;
      }, {})
  );

  const objectMap = (object, mapFn) =>
    Object.keys(object).reduce((result, key) => {
      result[key] = mapFn(object[key]);
      return result;
    }, {});

  if (!app.fs.existsSync(`${app.__dirname}/web`)) return;

  app.event("getComponentDefinitions").then((data) => {
    const viewCreatorFields = objectMap(data, (format) => {
      if (!format.item) return false;

      const fields = format.item
        .filter((item) =>
          ["viewCreator", "dynamicField", "dropReference"].includes(item.type)
        )
        .map((item) => item.id);

      return fields.length ? fields : false;
    });
    const path = `${app.__dirname}/web/src/viewCreatorFields.json`;
    app.writeFileChanged(path, JSON.stringify(viewCreatorFields));
  });
};
