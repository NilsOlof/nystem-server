export default (app) => {
  return;
  if (window.nystemLoaded) return;
  window.nystemLoaded = true;

  const getStackTrace = (row) => {
    const obj = {};
    if (!Error.captureStackTrace) return "";
    Error.captureStackTrace(obj, getStackTrace);

    const [, source, line, column] =
      /https?:\/\/[^/]+\/([^:]+):([^:]+):([0-9]+)/im.exec(
        obj.stack.split("\n")[row],
      ) || [];

    return !source
      ? obj.stack.split("\n")[row]
      : `\x1B[48;2;220;220;220m${source} ${line}:${column}\x1B[m \n`;
  };

  if (
    typeof window !== "undefined" &&
    window?.location?.host?.includes(".localhost")
  ) {
    const base = window?.location?.host?.replace(".localhost", "");

    const replace = (all, source, line, column) => {
      const replaceSource = (txt) =>
        txt
          .replace(base, `${app.settings.domain.replace(".localhost", "")}`)
          .replace("/core/", "/c/")
          .replace("/module/", "/m/")
          .replace("/component/", "/c/");

      return line
        ? `nystem://${base}${replaceSource(source)}.${line.replace(" ", "")}`
        : all;
    };

    const translate = (str) =>
      str.replace(/src([^:]+)\?t=[0-9]+ ([0-9]+):([0-9]+)/gim, replace);

    const replaceLinks =
      (callback) =>
      async (...args) => {
        // await translater.load();

        window.console.error = replaceLinksSync(errorLog);
        window.console.log = (...args) =>
          replaceLinksSync(oldLog)(getStackTrace(2), ...args);

        replaceLinksSync(callback, "0 ")(...args);
      };

    const replaceLinksSync =
      (callback, pre) =>
      (...args) => {
        for (let i = 0; i < args.length; i++)
          if (typeof args[i] === "string") args[i] = translate(args[i], pre);

        callback(...args);
      };

    const errorLog = window.console.error;
    window.console.error = replaceLinks(errorLog);

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
  }
};
