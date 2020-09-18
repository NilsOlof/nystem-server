module.exports = function(app) {
  /* const pathRegexp = function(path, keys, sensitive, strict) {
    if (Object.prototype.toString.call(path) === "[object RegExp]") return path;
    if (Array.isArray(path)) path = "(" + path.join("|") + ")";
    path = path
      .concat(strict ? "" : "/?")
      .replace(/\/\(/g, "(?:/")
      .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?(\*)?/g, function(
        _,
        slash,
        format,
        key,
        capture,
        optional,
        star
      ) {
        keys.push({ name: key, optional: !!optional });
        slash = slash || "";
        return (
          "" +
          (optional ? "" : slash) +
          "(?:" +
          (optional ? slash : "") +
          (format || "") +
          (capture || ((format && "([^/.]+?)") || "([^/]+?)")) +
          ")" +
          (optional || "") +
          (star ? "(/*)?" : "")
        );
      })
      .replace(/([/.])/g, "\\$1")
      .replace(/\* /g, "(.*)"); Change * /
    return new RegExp("^" + path + "$", sensitive ? "" : "i");
}; */

  app.parseURL = function(url) {
    url = url.replace(/^[^/]+:\/\/[^/]+/gi, "");
    const out = {};
    const hashtag = url.split("#");
    let query = hashtag[0].split(/\/?\?/);
    out.path = query[0].split("/");
    out.domain = out.path.shift();
    out.query = {};
    out.hashtag = hashtag[1];
    query = query[1] ? query[1].split("&") : false;
    for (const i in query) {
      const param = query[i].split("=");
      out.query[param[0]] = param[1];
    }
    return out;
  };

  /* app.on("loaded", () => {
    if (app.settings.extension) {
      const to = "/";
      if (
        window.localStorage["lastpos"] &&
        window.localStorage["lastpos"] !== "/index.html"
      )
        to = window.localStorage["lastpos"];
      window.history.pushState({}, "Site", to);
      app.router.setState();
    }
  }); */
};
