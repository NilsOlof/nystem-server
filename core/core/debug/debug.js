module.exports = function(app) {
  function getStackTrace(row) {
    const obj = {};
    Error.captureStackTrace(obj, getStackTrace);
    if (row) return obj.stack.split("\n")[row].replace("   at ", "");
    return obj.stack;
  }

  app.debug = {
    getStackTrace
  };

  let chokidar;
  try {
    chokidar = require("chokidar");
  } catch (e) {
    return;
  }

  function pathParserChange({ path, type }) {
    path.shift();
    path.shift();

    const update = {
      type: "debugModeUpdateOnChange",
      fileEvent: type
    };
    if (path[1] === "style") update.event = "styleChange";

    if (path[1] === "contentType") update.event = "contentTypeChange";

    if (path[1] === "component" && path[path.length - 1].indexOf(".jsx") !== -1)
      update.event = "componentChange";

    if (update.event) {
      app.event("debugModeUpdateOnChange", update);
      app.connection.broadcast(update);
    }
  }

  function fileWatchService(path, basePath) {
    const watcher = chokidar.watch(basePath + path, {
      ignored: /[\/\\]\./,
      persistent: true,
      ignoreInitial: true
    });

    basePath = basePath.replace(/\\/g, "/");

    function parse({ path, type }) {
      path = path.replace(/\\/g, "/").replace(basePath, "");
      app.event("debugModeFileChange", { path, type });
      pathParserChange({ path: path.split("/"), type });
    }

    watcher
      .on("add", path => parse({ path, type: "add" }))
      .on("change", path => parse({ path, type: "change" }))
      .on("unlink", path => parse({ path, type: "unlink" }))
      .on("error", function(error) {
        console.error("Error happened", error);
      });
  }

  fileWatchService("/core", app.__dirname);
  fileWatchService("/module", app.__dirname);
};
