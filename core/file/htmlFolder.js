export default (app) => {
  const readAndCopy = async (path, unlink) => {
    const destPath = path.split("/").slice(3).join("/");
    const dest = `${app.__dirname}/web/public/${destPath}`;
    const src = `${app.__dirname}/${path}`;

    if (unlink === true) app.fs.unlink(dest);
    else await app.fs.copy(src, dest);
  };

  const exclude = ["index.html", "manifest.json"];
  const updateFiles = async () => {
    const htmlFiles = app.filePaths.filter((path) => {
      const [, , folder, file] = path.split("/");
      return folder === "html" && !exclude.includes(file);
    });
    // eslint-disable-next-line no-restricted-syntax
    for (const path of htmlFiles) await readAndCopy(path);
  };
  updateFiles();

  app.on("debugModeFileChange", ({ path, type }) => {
    const [, , , folder, file] = path.split("/");
    if (folder !== "html" || exclude.includes(file)) return;

    readAndCopy(path.slice(1), type === "unlink");
  });

  const updateIndexHTML = async () => {
    const indexes = app.filePaths.filter((path) => {
      const [, , folder, file] = path.split("/");
      return folder === "html" && file === "index.html";
    });

    const content = await app.readFile(indexes[indexes.length - 1]);
    const headFiles = await Promise.all(
      app.filePaths
        .filter((path) => {
          const [, , folder, file] = path.split("/");
          return folder === "html" && file === "head.html";
        })
        .map((path) => app.readFile(path)),
    );

    await app.writeFileChanged(
      `${app.__dirname}/web/index.html`,
      content
        .replace("</head>", `${headFiles.join("\n")}\n</head>`)
        .replace(
          "<body>",
          `<body><script type="module" src="/src/index.js"></script>`,
        )
        .replace(/\{name\}/gi, app.settings.client.name || "")
        .replace(
          /\{description\}/gi,
          app.settings.client.description || app.settings.client.name,
        ),
    );
  };

  updateIndexHTML();
};
