export default async (app, extensionPath, debug = !!app.settings.debug) => {
  const { client } = await app.fs.readJson(`${app.__dirname}/data/host.json`);
  await app.fs.outputFile(
    `${extensionPath}/settings.js`,
    `export default ${JSON.stringify({ ...client, debug }, null, 2)};\n`,
  );
};
