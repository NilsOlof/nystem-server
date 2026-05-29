import http from "node:http";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default function (app) {
  if (!app.settings.chromextension) return;

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
  const jsModulePath = (path) =>
    path.replace(/\.(?:jsx|ts|tsx)$/i, ".js");
  const localPath = (path) => jsModulePath(pathWithSlash(path).split("?")[0]);

  const getImports = (contents) => {
    const importexp =
      /(?:import\s+(?:[^"']*?\s+from\s*)?|import\s*\(|export\s+[^"']*?\s+from\s*)["']([^"']+)["']/gim;
    let match = importexp.exec(contents);
    const result = [];
    while (match != null) {
      const path = match[1];
      if (path.startsWith("/") && !path.startsWith("/@")) result.push(path);
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
        const match = served.match(
          /const __vite__css = ((?:"(?:\\.|[^"\\])*")|(?:'(?:\\.|[^'\\])*'))/
        );
        const contents = match
          ? JSON.parse(match[1])
          : served;
        await fs.ensureFile(`${extPath}${path}`);
        await fs.writeFile(`${extPath}${path}`, contents);
      })
    );
  };

  const extensionModule = (contents) =>
    contents
      .replace(
        /import\s+\{[^}]*createHotContext[^}]*\}\s+from\s+["']\/@vite\/client["'];\s*import\.meta\.hot\s*=\s*[^;]+;\s*/gim,
        ""
      )
      .replace(/^.*\/@vite\/client.*\n?/gm, "")
      .replace(
        /(["'])(\/[^"']+\.(?:js|jsx|ts|tsx|css))(?:\?[^"']*)?\1/gim,
        (_, quote, path) => `${quote}${localPath(path)}${quote}`
      )
      .replace(/^\s*import\s+["'][^"']+\.css(?:\?[^"']*)?["'];?\s*$/gm, "")
      .replace(/\nimport \* as RefreshRuntime from "\/@react-refresh";[\s\S]*?(?=\n\/\/# sourceMappingURL=|\n$)/gim, "")
      .replace(/\n\s*const currentExports = __vite_react_currentExports;[\s\S]*?(?=\n\/\/# sourceMappingURL=|\n$)/gim, "")
      .replace(/\$RefreshSig\$\(\)/g, "(() => {})")
      .replace(/^\s*\$RefreshReg\$\([^;]+;\s*$/gm, "")
      .replace(
        /^\s*import\s+([\w$]+)\s+from\s+["']([^"']+\.json)(?:\?[^"']*)?["'];?\s*$/gm,
        (_, name, path) =>
          `const ${name} = await fetch("${localPath(path)}").then((response) => response.json());`
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
      const moduleContents = targetPath.endsWith(".js")
        ? Buffer.from(extensionModule(contents.toString()))
        : contents;
      files.set(targetPath, moduleContents);

      if (targetPath.endsWith(".js")) {
        getCssImports(contents.toString()).forEach((importPath) => {
          cssFiles.add(resolveCssPath(importPath, targetPath));
        });
        getImports(contents.toString()).forEach((importPath) => {
          const targetImportPath = localPath(importPath);
          if (!targetImportPath.endsWith(".css") && !files.has(targetImportPath))
            pending.push(importPath);
        });
      }
    }

    await Promise.all(
      [...files.entries()].map(async ([path, contents]) => {
        await fs.ensureFile(`${extPath}${path}`);
        await fs.writeFile(`${extPath}${path}`, contents);
      })
    );
    await copyCssFiles(cssFiles);

    return { files, cssFiles };
  };

  const extensionPageHtml = async (html, filename, cssFiles) => {
    let inlineScript = 0;
    const writes = [];

    const withoutDevScripts = html.replace(
      /<script\b[^>]*>(?:(?!<\/script>)[\s\S])*@react-refresh(?:(?!<\/script>)[\s\S])*<\/script>\s*|<script\b[^>]*\bsrc="\/@vite\/client"[^>]*><\/script>\s*/gim,
      ""
    );

    const withoutQueryStrings = withoutDevScripts.replace(
      /\s(href|src)="([^"]+\.(?:js|json|css))\?[^"]*"/gim,
      (_, key, path) => ` ${key}="${path}"`
    );

    const withoutInlineScripts = withoutQueryStrings.replace(
      /<script\b((?:(?!\bsrc=)[^>])*)>([\s\S]*?)<\/script>/gim,
      (script, attributes, contents) => {
        if (!contents.trim()) return script;

        inlineScript += 1;
        const path = `${filename}-inline-${inlineScript}.js`;
        writes.push(fs.writeFile(`${extPath}/${path}`, contents));
        return `<script${attributes} src="${path}"></script>`;
      }
    );

    await Promise.all(writes);

    const cssLinks = [...cssFiles]
      .map((path) => `<link rel="stylesheet" href="${path}">`)
      .join("\n");

    if (!cssLinks) return withoutInlineScripts;
    if (withoutInlineScripts.includes("</head>"))
      return withoutInlineScripts.replace("</head>", `${cssLinks}\n</head>`);
    return `${cssLinks}\n${withoutInlineScripts}`;
  };

  const backgroundScript = (bundle) => `(() => {
  const noop = () => {};
  let document = globalThis.document;
  const makeElement = (tagName = "div") => {
    const nodeName = tagName.toUpperCase();
    return {
      tagName: nodeName,
      nodeName,
      nodeType: 1,
      style: {},
      children: [],
      childNodes: [],
      parentNode: null,
      ownerDocument: document,
      textContent: "",
      appendChild(child) {
        this.children.push(child);
        this.childNodes.push(child);
        child.parentNode = this;
        return child;
      },
      removeChild(child) {
        this.children = this.children.filter((item) => item !== child);
        this.childNodes = this.childNodes.filter((item) => item !== child);
        child.parentNode = null;
        return child;
      },
      setAttribute: noop,
      removeAttribute: noop,
      addEventListener: noop,
      removeEventListener: noop,
      getContext: () => null,
    };
  };
  document = document || {
    nodeType: 9,
    nodeName: "#document",
    createElement: makeElement,
    createTextNode: (text) => ({ nodeType: 3, nodeName: "#text", textContent: text, ownerDocument: document }),
    getElementById: () => null,
    querySelector: () => null,
    addEventListener: noop,
    removeEventListener: noop,
  };
  document.defaultView = globalThis;
  document.body = document.body || makeElement("body");
  document.documentElement = document.documentElement || makeElement("html");
  globalThis.window = globalThis.window || {
    addEventListener: noop,
    removeEventListener: noop,
  };
  globalThis.document = document;
  const navigator = globalThis.navigator || { platform: "" };
  const location = globalThis.location || { protocol: "chrome-extension:", host: "", pathname: "/" };
  globalThis.window.document = document;
  globalThis.window.navigator = navigator;
  globalThis.window.location = location;
})();
${bundle}
`;

  const serviceWorkerScript = () => `${backgroundScript("")}
globalThis.chrome?.runtime?.onInstalled?.addListener?.(() => {});
`;

  const update = async () => {
    console.log("Update extension");
    clearTimeout(timer);

    const indexHtml = (await fetch(host)).toString();

    const includePaths = getIncludes(indexHtml).filter(
      (path) => !path.includes("manifest.json") && !path.startsWith("/@")
    );
    const { files, cssFiles } = await copyFiles(includePaths);
    const bundle = [...files.values()].reduce(
      (result, contents) => `${result}\n${contents}`,
      ""
    );

    const features = JSON.parse(
      await fs.readFile(`${__dirname}/features.json`, "utf-8")
    );
    const entrypoints = features.filter((item) =>
      ["popup", "background", "content", "devtools"].includes(item)
    );

    await Promise.all(entrypoints.map(async (filename) => {
      if (["content"].includes(filename)) {
        const { content } = await app.event("extensionContent");
        await fs.writeFile(`${extPath}/${filename}.js`, content || bundle);
        return;
      }

      if (["background"].includes(filename)) {
        await fs.writeFile(
          `${extPath}/${filename}.js`,
          serviceWorkerScript()
        );
        return;
      }

      if (["devtools"].includes(filename)) {
        await fs.writeFile(
          `${extPath}/devtoolsinit.js`,
          `chrome.devtools.panels.create("${name}","icon/32.png","devtools.html", (panel)=>{});`
        );
        await fs.writeFile(
          `${extPath}/devtoolsinit.html`,
          `<script src="devtoolsinit.js"></script>`
        );
      }

      await fs.writeFile(
        `${extPath}/${filename}.html`,
        await extensionPageHtml(indexHtml, filename, cssFiles)
      );
    }));
  };

  const compileAndCopy = async () => {
    await update();
    const manifest = await app.require("./manifest", true);
    await manifest(app);
    [16, 24, 32, 48, 128, 512].forEach((size) => {
      fetch(`${host}/icon/${size}.png`).then((buffer) => {
        fs.outputFile(`${extPath}/icon/${size}.png`, buffer);
      });
    });
  };

  app.on("start", () => {
    setTimeout(compileAndCopy, 1000);
  });

  if (app.settings.debug === "hhhå")
    app.on("debugModeFileChange", (event) => {
      const parts = event.path.split("/");
      if (!["component", "style", "contentType"].includes(parts[3])) return;

      timer = setTimeout(update, 1000);
    });
};
