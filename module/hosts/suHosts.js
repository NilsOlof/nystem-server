module.exports = function(path) {
  var fs = require("fs");
  return {
    get: function(callback) {
      callback(fs.readFileSync(path, "utf8"));
    },
    set: function(data, callback) {
      fs.writeFile(path, data, callback || (() => {}));
    }
  };
};
