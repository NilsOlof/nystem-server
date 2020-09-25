const fs = require("fs");

module.exports = function () {
  return {
    set: function ({ path, topath }) {
      if (fs.statSync(path).isDirectory()) fs.symlinkSync(path, topath, "dir");
      else fs.symlinkSync(path, topath, "file");
    },
  };
};
