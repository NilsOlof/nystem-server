import http from "node:http";
import { dirname, relative } from "node:path";
import { crc32, deflateRawSync } from "node:zlib";
import { fileURLToPath } from "node:url";
import buildBackground from "./buildBackground.js";
import writeSettings from "./settings.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default function (app) {
  if (!app.settings.chromextension) return;

  app.file.on("get", 950, async ({ id, url }) => {
    if (url !== "/files/extension") return;

    await app.event("extensionBuild");
    const extPath = `${app.__dirname}/files/extension`;
    const entries = await app.fs.readdir(extPath, { recursive: true, withFileTypes: true });
    const local = [];
    const central = [];
    let offset = 0;
    for (const entry of entries.filter((entry) => entry.isFile())) {
      const name = Buffer.from(relative(extPath, `${entry.parentPath}/${entry.name}`).replaceAll("\\", "/"));
      const contents = await app.fs.readFile(`${entry.parentPath}/${entry.name}`);
      const data = deflateRawSync(contents);
      const header = Buffer.alloc(46);
      header.writeUInt32LE(0x02014b50, 0);
      header.writeUInt16LE(20, 4);
      header.writeUInt16LE(20, 6);
      header.writeUInt16LE(0x0800, 8);
      header.writeUInt16LE(8, 10);
      header.writeUInt16LE(0x21, 14);
      header.writeUInt32LE(crc32(contents), 16);
      header.writeUInt32LE(data.length, 20);
      header.writeUInt32LE(contents.length, 24);
      header.writeUInt16LE(name.length, 28);
      header.writeUInt32LE(offset, 42);
      const localHeader = Buffer.concat([Buffer.from([0x50, 0x4b, 0x03, 0x04]), header.subarray(6, 32)]);
      local.push(localHeader, name, data);
      central.push(header, name);
      offset += localHeader.length + name.length + data.length;
    }
    const directory = Buffer.concat(central);
    const end = Buffer.alloc(22);
    end.writeUInt32LE(0x06054b50, 0);
    end.writeUInt16LE(central.length / 2, 8);
    end.writeUInt16LE(central.length / 2, 10);
    end.writeUInt32LE(directory.length, 12);
    end.writeUInt32LE(offset, 16);

    await app.file.event("response", {
      id,
      data: Buffer.concat([...local, directory, end]),
      closed: true,
      headers: {
        "content-type": "application/zip",
        "content-disposition": `attachment; filename="${app.settings.client.name.toLowerCase()}-extension.zip"`,
        "cache-control": "no-store",
      },
    });
    return {};
  });

  if (!app.settings.debug) {
    const copyBuild = async () => {
      await app.fs.emptyDir(`${app.__dirname}/files/extension`);
      await app.fs.copy(`${app.__dirname}/build/extension`, `${app.__dirname}/files/extension`);
      await writeSettings(app, `${app.__dirname}/files/extension`, false);
    };
    app.on("extensionBuild", copyBuild);
    return;
  }

  const fetch = (url) =>
    new Promise((resolve, reject) => {
      http
        .request(url, (response) => {
          const bufs = [];

          response.on("data", (chunk) => {
            bufs.push(chunk);
          });

          response.on("end", () => {
            resolve(Buffer.concat(bufs));
          });

          response.on("error", (error) => {
            console.log(error);
            reject(error);
          });
        })
        .end();
    });

  let timer;
  const { name } = app.settings.client;

  const host = `http://localhost:${app.settings.port}`;
  const extPath = `${app.__dirname}/files/extension`;
  const { fs } = app;

  const getIncludes = (html) => {
    const scriptexp = / (href|src)="([^"]+\.(js|json|css)(?:\?[^"]*)?)"/gim;
    let match = scriptexp.exec(html);
    const result = [];
    while (match != null) {
      result.push(match[2]);
      match = scriptexp.exec(html);
    }
    return result;
  };

  const pathWithSlash = (path) => (path.startsWith("/") ? path : `/${path}`);
  const jsModulePath = (path) => path.replace(/\.(?:jsx|ts|tsx)$/i, ".js");
  const localPath = (path) => jsModulePath(pathWithSlash(path).split("?")[0]);

  const getImports = (contents, fromPath) => {
    const importexp =
      /(?:import\s*(?:[^"'`;]*?\bfrom\s*)?|import\s*\(\s*|export\s*[^"'`;]*?\bfrom\s*)["'`]([^"'`]+)["'`]/gim;
    let match = importexp.exec(contents);
    const result = [];
    while (match != null) {
      const path = match[1];
      if ((path.startsWith("/") && !path.startsWith("/@")) || path.startsWith("."))
        result.push(new URL(path, `${host}${fromPath}`).pathname);
      match = importexp.exec(contents);
    }
    return result;
  };

  const getCssImports = (contents) => {
    const importexp = /^\s*import\s+["']([^"']+\.css(?:\?[^"']*)?)["'];?\s*$/gim;
    let match = importexp.exec(contents);
    const result = [];
    while (match != null) {
      result.push(match[1]);
      match = importexp.exec(contents);
    }
    return result;
  };

  const resolveCssPath = (importPath, fromPath) => {
    if (importPath.startsWith("/")) return localPath(importPath);
    if (importPath.startsWith(".")) {
      const parts = fromPath.split("/");
      parts.pop();
      importPath.split("/").forEach((part) => {
        if (!part || part === ".") return;
        if (part === "..") parts.pop();
        else parts.push(part);
      });
      return localPath(parts.join("/"));
    }
    return localPath(`/node_modules/${importPath}`);
  };

  const copyCssFiles = async (paths) => {
    await Promise.all(
      [...new Set(paths)].map(async (path) => {
        const served = (await fetch(`${host}${pathWithSlash(path)}`)).toString();
        const match = served.match(/const __vite__css = ((?:"(?:\\.|[^"\\])*")|(?:'(?:\\.|[^'\\])*'))/);
        const contents = match ? JSON.parse(match[1]) : served;
        await fs.ensureFile(`${extPath}${path}`);
        await fs.writeFile(`${extPath}${path}`, contents);
      }),
    );
  };

  const extensionModule = (contents) =>
    contents
      .replace(
        /import\s+\{[^}]*createHotContext[^}]*\}\s+from\s+["']\/@vite\/client["'];\s*import\.meta\.hot\s*=\s*[^;]+;\s*/gim,
        "",
      )
      .replace(/^.*\/@vite\/client.*\n?/gm, "")
      .replace(
        /(["'])(\/[^"']+\.(?:js|jsx|ts|tsx|css))(?:\?[^"']*)?\1/gim,
        (_, quote, path) => `${quote}${localPath(path)}${quote}`,
      )
      .replace(/^\s*import\s+["'][^"']+\.css(?:\?[^"']*)?["'];?\s*$/gm, "")
      .replace(/import \* as RefreshRuntime from "\/@react-refresh";[\s\S]*?(?=\n\/\/# sourceMappingURL=|$)/g, "")
      .replace(
        /\n\s*const currentExports = __vite_react_currentExports;[\s\S]*?(?=\n\/\/# sourceMappingURL=|\n$)/gim,
        "",
      )
      .replace(/if \(import\.meta\.hot\) import\.meta\.hot\.send\("nystem:component-load", [^\n]*?\);/g, "")
      .replace(/\$RefreshSig\$\(\)/g, "(() => {})")
      .replace(/^\s*\$RefreshReg\$\([^;]+;\s*$/gm, "")
      .replace(
        /^\s*import\s+([\w$]+)\s+from\s+["']([^"']+\.json)(?:\?[^"']*)?["'];?\s*$/gm,
        (_, name, path) => `import ${name} from "${localPath(path)}.js";`,
      );

  const copyFiles = async (paths) => {
    const files = new Map();
    const cssFiles = new Set();
    const pending = [...new Set(paths)];

    while (pending.length) {
      const path = pending.shift();
      const targetPath = localPath(path);
      if (files.has(targetPath)) continue;

      const contents = targetPath.endsWith(".json")
        ? await fs.readFile(`${app.__dirname}/web${targetPath}`)
        : await fetch(`${host}${pathWithSlash(path)}`);
      const moduleContents =
        targetPath === "/src/settings.json"
          ? Buffer.from('export { default } from "/settings.js";\n')
          : targetPath.endsWith(".js")
            ? Buffer.from(extensionModule(contents.toString()))
            : targetPath.endsWith(".json")
              ? Buffer.from(`export default ${contents.toString()};\n`)
              : contents;
      files.set(targetPath.endsWith(".json") ? `${targetPath}.js` : targetPath, moduleContents);

      if (targetPath.endsWith(".js")) {
        getCssImports(contents.toString()).forEach((importPath) => {
          cssFiles.add(resolveCssPath(importPath, targetPath));
        });
        getImports(contents.toString(), targetPath).forEach((importPath) => {
          const targetImportPath = localPath(importPath);
          if (!targetImportPath.endsWith(".css") && !files.has(targetImportPath)) pending.push(importPath);
        });
      }
    }

    await Promise.all(
      [...files.entries()].map(async ([path, contents]) => {
        await fs.ensureFile(`${extPath}${path}`);
        await fs.writeFile(`${extPath}${path}`, contents);
      }),
    );
    await copyCssFiles(cssFiles);

    return { files, cssFiles };
  };

  const extensionPageHtml = async (html, filename, cssFiles) => {
    let inlineScript = 0;
    const writes = [];

    const withoutDevScripts = html.replace(
      /<script\b[^>]*>(?:(?!<\/script>)[\s\S])*@react-refresh(?:(?!<\/script>)[\s\S])*<\/script>\s*|<script\b[^>]*\bsrc="\/@vite\/client"[^>]*><\/script>\s*/gim,
      "",
    );

    const withoutQueryStrings = withoutDevScripts.replace(
      /\s(href|src)="([^"]+\.(?:js|json|css))\?[^"]*"/gim,
      (_, key, path) => ` ${key}="${path}"`,
    );

    const withoutInlineScripts = withoutQueryStrings.replace(
      /<script\b((?:(?!\bsrc=)[^>])*)>([\s\S]*?)<\/script>/gim,
      (script, attributes, contents) => {
        if (!contents.trim()) return script;

        inlineScript += 1;
        const path = `${filename}-inline-${inlineScript}.js`;
        writes.push(fs.writeFile(`${extPath}/${path}`, contents));
        return `<script${attributes} src="${path}"></script>`;
      },
    );

    await Promise.all(writes);

    const cssLinks = [...cssFiles].map((path) => `<link rel="stylesheet" href="${path}">`).join("\n");

    if (!cssLinks) return withoutInlineScripts;
    if (withoutInlineScripts.includes("</head>"))
      return withoutInlineScripts.replace("</head>", `${cssLinks}\n</head>`);
    return `${cssLinks}\n${withoutInlineScripts}`;
  };

  const update = async () => {
    console.log("Update extension");
    clearTimeout(timer);
    await fs.ensureDir(extPath);
    await writeSettings(app, extPath);

    const indexHtml = (await fetch(host)).toString();

    const includePaths = getIncludes(indexHtml).filter(
      (path) => !path.includes("manifest.json") && !path.startsWith("/@"),
    );
    const { files, cssFiles } = await copyFiles(includePaths);
    const bundle = [...files.values()].reduce((result, contents) => `${result}\n${contents}`, "");

    const features = JSON.parse(await fs.readFile(`${__dirname}/features.json`, "utf-8"));
    const entrypoints = features.filter((item) => ["popup", "background", "content", "devtools"].includes(item));

    await Promise.all(
      entrypoints.map(async (filename) => {
        if (["content"].includes(filename)) {
          const { content } = await app.event("extensionContent");
          await fs.writeFile(`${extPath}/${filename}.js`, content || bundle);
          return;
        }

        if (["background"].includes(filename)) {
          const background = app.settings.debug
            ? await buildBackground(`${app.__dirname}/web`)
            : await fs.readFile(`${app.__dirname}/build/extension/background.js`, "utf8");
          await fs.writeFile(
            `${extPath}/background.js`,
            `import __EXTENSION_CLIENT_SETTINGS__ from "./settings.js";\n${background}`,
          );
          return;
        }

        if (["devtools"].includes(filename)) {
          const { script = "" } = await app.event("extensionDevtools");
          await fs.writeFile(
            `${extPath}/devtoolsinit.js`,
            `chrome.devtools.panels.create("${name}","icon/32.png","devtools.html", (panel)=>{});\n${script}`,
          );
          await fs.writeFile(`${extPath}/devtoolsinit.html`, `<script src="devtoolsinit.js"></script>`);
        }

        await fs.writeFile(`${extPath}/${filename}.html`, await extensionPageHtml(indexHtml, filename, cssFiles));
      }),
    );
  };

  const compileAndCopy = async () => {
    await fs.emptyDir(extPath);
    await update();
    const manifest = await app.require("./manifest", true);
    await manifest(app);
    await Promise.all(
      [16, 24, 32, 48, 128, 512].map(async (size) => {
        await fs.outputFile(`${extPath}/icon/${size}.png`, await fetch(`${host}/icon/${size}.png`));
      }),
    );
  };

  app.on("extensionBuild", compileAndCopy);

  if (app.settings.debug === "hhhå")
    app.on("debugModeFileChange", (event) => {
      const parts = event.path.split("/");
      if (!["component", "style", "contentType"].includes(parts[3])) return;

      timer = setTimeout(update, 1000);
    });
}
