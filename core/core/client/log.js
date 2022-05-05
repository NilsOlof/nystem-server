module.exports = (app) => {
  const getStackTrace = (row) => {
    const obj = {};
    if (!Error.captureStackTrace) return "";
    Error.captureStackTrace(obj, getStackTrace);

    const [, source, line, column] =
      /https?:\/\/[^/]+\/([^:]+):([^:]+):([0-9]+)/im.exec(
        obj.stack.split("\n")[row]
      ) || [];

    return !source
      ? obj.stack.split("\n")[row]
      : `\x1B[48;2;220;220;220m${source}:${line}:${column}\x1B[m \n`;
  };

  if (
    typeof window !== "undefined" &&
    window?.location?.host?.includes(".localhost")
  ) {
    const replaceLinks =
      (callback) =>
      async (...args) => {
        for (let i = 0; i < args.length; i++)
          if (typeof args[i] === "string") args[i] = await translate(args[i]);

        callback(...args);
      };

    window.console.error = replaceLinks(window.console.error);
    window.addEventListener("unhandledrejection", (ev) => {
      console.error(ev.reason.message, ev.reason.stack);
      ev.stopPropagation();
      ev.preventDefault();
    });

    const oldLog = window.console.log;
    window.console.log = (...args) =>
      replaceLinks(oldLog)(getStackTrace(2), ...args);

    window.onerror = function (message, source, lineno, colno, error) {
      if (error) console.error(error.stack);
      else console.error(message, source, lineno, colno);
      return true;
    };

    const translate = (() => {
      let consumer = false;
      let base = "";
      const load = () =>
        new Promise((resolve) => {
          callbacks.push(resolve);
          if (callbacks.length > 1) return;

          const scriptEl = document.createElement("script");

          scriptEl.setAttribute("src", "/source-map.js");
          scriptEl.onload = async () => {
            window.sourceMap.SourceMapConsumer.initialize({
              "lib/mappings.wasm":
                "https://unpkg.com/source-map@0.7.3/lib/mappings.wasm",
            });
            const mapData = await fetch("/static/js/bundle.js.map").then(
              (res) => res.json()
            );
            base = mapData.sources[0].replace(/\/components.js/, "");
            app.on("devtoolsnystvscode", (q) => ({ ...q, base }));

            consumer = await new window.sourceMap.SourceMapConsumer(mapData);
            callbacks.forEach((callback) => callback());
          };
          document.head.appendChild(scriptEl);
        });

      const callbacks = [];
      const replace = (all, source, line, column) => {
        if (!column) return all;

        ({ source, line, column } = consumer.originalPositionFor({
          line: parseInt(line, 10),
          column: parseInt(column, 10),
        }));

        const replaceSource = (txt) =>
          txt
            .replace(base, `${app.settings.domain.replace(".localhost", "")}`)
            .replace("/core/", "/c/")
            .replace("/module/", "/m/")
            .replace("/component/", "/c/");

        return line ? `nystem://${replaceSource(source)}.${line}` : all;
      };

      return async (str) => {
        if (!consumer) await load();

        return str
          .replace(/https?:\/\/[^/]+\/([^:]+):([0-9]+):([0-9]+)/gim, replace)
          .replace(/(static\/js\/bundle.js):([0-9]+):([0-9]+)/gim, replace);
      };
    })();
  }
};
