module.exports = (app) => {
  if (!app.fs.existsSync(`${app.__dirname}/web`)) return;

  if (app.fs.existsSync(`${app.__dirname}/files/icons.json`))
    app.fs.copyFileSync(
      `${app.__dirname}/files/icons.json`,
      `${app.__dirname}/web/src/icons.json`
    );
  else app.fs.writeFileSync(`${app.__dirname}/web/src/icons.json`, "{}");

  const iconpath = app.settings.iconsrcpath?.replace(/\\/g, "/");
  if (!iconpath) return;
  const { fs } = app;

  const readPath = (path, paths = []) => {
    if (!fs.existsSync(path)) return;

    if (fs.statSync(path).isDirectory()) {
      const files = fs.readdirSync(path);
      for (let i = 0; i < files.length; i++)
        readPath(`${path}/${files[i]}`, paths);
    } else paths.push(path.replace(`${iconpath}/`, ""));
    return paths;
  };

  const allicons = {};

  readPath(iconpath).map((path) => {
    const src = fs.readFileSync(`${iconpath}/${path}`, "utf8");

    const parts = src.match(/.*viewBox="([^"]+)".*<path d="([^"]+)"/im);
    path = path.replace("/", "-").replace(/(^solid-)|(\.svg$)/gim, "");

    allicons[path] = `${parts[1]}|${parts[2]}`;
  });

  fs.writeFile(`${__dirname}/allicons.json`, JSON.stringify(allicons));
};
