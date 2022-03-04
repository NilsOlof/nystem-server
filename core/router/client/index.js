module.exports = (app) => {
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

  app.parseURL = (url) => {
    url = url.replace(/^[^/]+:\/\/[^/]+/gi, "");
    const out = {};
    const hashtag = url.split("#");
    let query = hashtag[0].split(/\/?\?/);
    out.path = query[0].split("/");
    out.domain = out.path.shift();
    out.query = {};
    // eslint-disable-next-line prefer-destructuring
    out.hashtag = hashtag[1];
    query = query[1] ? query[1].split("&") : false;
    // eslint-disable-next-line guard-for-in
    for (const i in query) {
      const param = query[i].split("=");
      // eslint-disable-next-line prefer-destructuring
      out.query[param[0]] = param[1];
    }
    return out;
  };
  /*
  app.on("loaded", async () => {
    if (app.settings.extension) {
      let to = "/";
      const lastpos = await app.storage.getItem("lastpos");
      if (lastpos && lastpos !== "/index.html") to = lastpos;

      window.history.pushState({}, "Site", to);
      app.router.setState();
    }
  });
*/
};
