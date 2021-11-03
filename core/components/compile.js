module.exports = (app) => {
  const { fs } = app;

  if (!app.fs.existsSync(`${app.__dirname}/web`)) return;

  function capFirst(text) {
    if (!text) return "";
    return text.substring(0, 1).toUpperCase() + text.substring(1);
  }

  function changeComponentNames(components, setStrings) {
    setStrings.forEach((key) => {
      const path = components[key];
      let src = fs.readFileSync(`${app.__dirname}/${path}`, "utf-8");
      const match = /export default ([a-z0-9]+);/gim.exec(src);
      if (
        match &&
        match[1] &&
        (src.indexOf(`class ${match[1]} extends `) !== -1 ||
          src.indexOf(`const ${match[1]} = `) !== -1)
      ) {
        src = src.replace(
          `export default ${match[1]};`,
          `export default ${key};`
        );
        src = src.replace(
          `class ${match[1]} extends `,
          `class ${key} extends `
        );
        src = src.replace(`const ${match[1]} = `, `const ${key} = `);
        app.fs.writeFileSync(`${app.__dirname}/${path}`, src);
      }
    });
  }

  app.on("getComponents", () => {
    const paths = app.filePaths;
    const components = { core: {}, module: {} };
    paths.forEach((fullpath) => {
      const path = fullpath.split("/");
      const component = {};
      const type = path.shift();
      if (path[1] !== "component" || !/.js$/.test(path[path.length - 1]))
        return;
      component.name = capFirst(path[path.length - 1].replace(".js", ""));
      component.path = fullpath;
      if (path.length === 4)
        component.name = capFirst(path[2]) + component.name;
      components[type][component.name] = component.path;
    });
    return components;
  });

  function compile() {
    app.event("getComponents").then((components) => {
      components = { ...components.core, ...components.module };
      let setStrings = Object.keys(components);
      setStrings = setStrings.filter(
        (key) => components[key].indexOf(".native.js") === -1
      );
      changeComponentNames(components, setStrings);
    });
  }

  compile();

  let lastTime = Date.now();

  app.on("debugModeUpdateOnChange", (update) => {
    if (
      update.event !== "componentChange" ||
      (update.fileEvent === "change" && lastTime + 1000 * 10 > Date.now())
    )
      return;

    lastTime = Date.now();
    console.log("compile");
    compile();
  });

  app.on("getComponents", -100, (components) => {
    components = { ...components.core, ...components.module };
    let setStrings = Object.keys(components);
    setStrings = setStrings.filter((key) => {
      const pos = key.indexOf(".");
      if (pos !== -1) {
        delete components[key];
        return false;
      }
      return true;
    });

    let importsString = setStrings
      .map((key) => `import ${key} from "./${components[key]}";`)
      .join("\n");
    const importsString2 = setStrings.join(", ");

    importsString = `/* eslint-disable */\n${importsString}\nexport { ${importsString2} }`;

    app.writeFileChanged(
      `${app.__dirname}/web/src/components.js`,
      importsString
    );
    app.writeFileChanged(
      `${app.__dirname}/web/src/components.jsconfig.js`,
      importsString.replace(/"\.\//g, '"../../')
    );
  });
};
