module.exports = function() {
  var fs = require("fs");
  return {
    set: function({ path, topath }) {
      if (fs.statSync(path).isDirectory()) fs.symlinkSync(path, topath, "dir");
      else fs.symlinkSync(path, topath, "file");
    }
  };
};
