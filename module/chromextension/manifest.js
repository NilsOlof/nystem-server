import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async (app, extensionPath = `${app.__dirname}/files/extension`) => {
  const { fs } = app;
  const manifestPath = `${extensionPath}/manifest.json`;

  const getPart = (path) => fs.readFile(`${__dirname}/manifest/${path}.json`, "utf-8");

  const features = JSON.parse(await fs.readFile(`${__dirname}/features.json`, "utf-8"));

  const parts = await Promise.all(["base", ...features].map(async (path) => JSON.parse(await getPart(path))));

  const mergeKey = (d1, d2) => {
    if (d1 instanceof Array && d2 instanceof Array) return [...new Set([...d1, ...d2])];

    if (typeof d1 === "object" && typeof d2 === "object") {
      const commonkeys = Object.keys(d1).filter(Set.prototype.has, new Set(Object.keys(d2)));

      return Object.assign(d1, d2, ...commonkeys.map((key) => ({ [key]: mergeKey(d1[key], d2[key]) })));
    }

    return d2;
  };

  await fs.ensureFile(manifestPath);
  await fs.writeFile(
    manifestPath,
    JSON.stringify(parts.reduce(mergeKey, {}), null, "  ")
      .replaceAll("{name}", app.settings.client.name)
      .replaceAll("{domain}", app.settings.client.domain),
  );
};
