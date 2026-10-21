import { dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const directory = dirname(fileURLToPath(import.meta.url));

export default async (webPath) => {
  const { build } = await import(pathToFileURL(`${webPath}/node_modules/vite/dist/node/index.js`).href);
  const result = await build({
    configFile: false,
    root: webPath,
    logLevel: "warn",
    plugins: [
      {
        name: "extension-client-settings",
        enforce: "pre",
        resolveId(source, importer) {
          if (source.endsWith("/settings.json") && importer?.endsWith("/core/core/client/nystem.js"))
            return "\0extension-client-settings";
        },
        load(id) {
          if (id === "\0extension-client-settings") return "export default __EXTENSION_CLIENT_SETTINGS__;";
        },
      },
    ],
    resolve: {
      alias: {
        "react-dom/client": `${directory}/nullRenderer.js`,
        "react-reconciler": `${webPath}/node_modules/react-reconciler`,
        "react-dom": `${webPath}/node_modules/react-dom`,
        react: `${webPath}/node_modules/react`,
        "nystem-components": `${webPath}/src/components.js`,
        nystem: `${webPath}/src/core/core/client/nystem.js`,
        "my-moment": `${webPath}/src/core/date/client/my-moment.js`,
      },
    },
    define: { "process.env.NODE_ENV": '"production"' },
    build: {
      write: false,
      minify: false,
      rolldownOptions: {
        input: `${directory}/serviceWorkerScript.js`,
        moduleTypes: { ".js": "jsx" },
        transform: { jsx: "react-jsx" },
        output: { format: "es", entryFileNames: "background.js", codeSplitting: false },
      },
    },
  });
  return result.output.find((item) => item.type === "chunk" && item.isEntry).code;
};
