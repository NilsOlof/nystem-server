import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import buildBackground from "./buildBackground.js";
import manifest from "./manifest.js";
import writeSettings from "./settings.js";

const directory = dirname(fileURLToPath(import.meta.url));

export default async (app) => {
  const { fs, settings } = app;
  const extensionPath = `${app.__dirname}/build/extension`;
  await fs.emptyDir(extensionPath);
  await fs.copy(`${app.__dirname}/web/dist`, extensionPath);
  await writeSettings(app, extensionPath, false);
  const assets = await fs.readdir(`${extensionPath}/assets`);
  const settingsChunks = assets.filter((file) => /^settings-.*\.js$/.test(file));
  if (settingsChunks.length !== 1) throw new Error("Expected one separate settings chunk in the web build");
  const settingsChunk = `${extensionPath}/assets/${settingsChunks[0]}`;
  if (!(await fs.readFile(settingsChunk, "utf8")).includes("settings_default"))
    throw new Error("Unexpected web settings chunk export");
  await fs.writeFile(settingsChunk, 'export { default as settings_default } from "../settings.js";\n');

  const html = await fs.readFile(`${extensionPath}/index.html`, "utf8");
  let inlineScript = 0;
  const scripts = [];
  const page = html.replace(
    /<script\b((?:(?!\bsrc=)[^>])*)>([\s\S]*?)<\/script>/gim,
    (script, attributes, contents) => {
      if (!contents.trim()) return script;
      const filename = `inline-${++inlineScript}.js`;
      scripts.push(fs.outputFile(`${extensionPath}/${filename}`, contents));
      return `<script${attributes} src="${filename}"></script>`;
    },
  );
  await Promise.all(scripts);
  const features = await fs.readJson(`${directory}/features.json`);
  for (const feature of features) {
    if (feature === "popup" || feature === "devtools") await fs.outputFile(`${extensionPath}/${feature}.html`, page);
    if (feature === "background") {
      const background = await buildBackground(`${app.__dirname}/web`);
      await fs.outputFile(
        `${extensionPath}/background.js`,
        `import __EXTENSION_CLIENT_SETTINGS__ from "./settings.js";\n${background}`,
      );
    }
    if (feature === "content") {
      const { content } = await app.event("extensionContent");
      if (!content) throw new Error("Extension build requires an extensionContent handler");
      await fs.outputFile(`${extensionPath}/content.js`, content);
    }
    if (feature === "devtools") {
      const { script = "" } = await app.event("extensionDevtools");
      await fs.outputFile(`${extensionPath}/devtoolsinit.html`, '<script src="devtoolsinit.js"></script>');
      await fs.outputFile(
        `${extensionPath}/devtoolsinit.js`,
        `chrome.devtools.panels.create(${JSON.stringify(settings.client.name)},"icon/32.png","devtools.html",()=>{});\n${script}`,
      );
    }
  }
  if (!settings.favicon) throw new Error("Extension build requires a favicon source");
  const icon = await fs.readFile(`${app.__dirname}${settings.favicon}`);
  await Promise.all(
    [16, 24, 32, 48, 128, 512].map(async (size) => {
      await fs.outputFile(
        `${extensionPath}/icon/${size}.png`,
        await sharp(icon, { density: 512 })
          .resize(size, size, { fit: "contain", background: settings.bgColor || "#FFFFFF00" })
          .png()
          .toBuffer(),
      );
    }),
  );
  await manifest(app, extensionPath);
};
