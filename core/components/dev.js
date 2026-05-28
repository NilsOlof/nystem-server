export default async (app) => {
  if (!app.fs.existsSync(`${app.__dirname}/web`)) return;

  await app.require("./files");
  await app.require("./compile");
};
