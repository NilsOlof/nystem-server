const fs = require("fs");

module.exports = (ev) => {
  ev.on("mkSymLink", ({ path, topath }) => {
    if (fs.statSync(path).isDirectory()) fs.symlinkSync(path, topath, "dir");
    else fs.symlinkSync(path, topath, "file");
  });
};
