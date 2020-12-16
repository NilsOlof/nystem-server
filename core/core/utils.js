module.exports = function (app) {
  if (!app) app = {};
  const crypto = require("crypto");

  function capFirst(text) {
    if (!text) return "";
    return text.substring(0, 1).toUpperCase() + text.substring(1);
  }
  app.capFirst = capFirst;

  app.utils = {
    // Make copy of JSON object
    clone: function (obj) {
      return JSON.parse(JSON.stringify(obj));
    },
    // Varible exist
    exist: function (variable) {
      return !(
        typeof variable === "undefined" ||
        variable === null ||
        variable === ""
      );
    },
    // Older md5 encryption
    md5: function (text) {
      return crypto.createHash("md5").update(text).digest("hex");
    },
    // Encrypt password with slow blowfish with id as salt
    encryptPassword: function (password, salt) {
      const encrypt = crypto.createCipheriv("BF-ECB", salt, "");
      let hex = encrypt.update(password, "ascii", "hex");
      hex += encrypt.final("hex");
      // const scrypt = require('js-scrypt');
      // console.log(scrypt.hashSync(password,salt).toString('hex'));
      return hex;
    },
    // Translate text
    t: function (text, lang) {
      if (app.translations[lang] && app.translations[lang][text])
        return app.translations[lang][text];
      return text;
    },
    // Translate longer text replaceing all t(text)
    translate: function (text, lang) {
      return text.replace(/t\('([^']+)'\)/g, (str, p1, offset, s) => {
        if (app.translations[lang] && app.translations[lang][p1])
          return app.translations[lang][p1];
        return p1;
      });
    },
    // Insert data in text
    insertValues: function (text, data) {
      return text.replace(/{([a-z0-9_\.]+)}/gi, (str, p1, offset, s) => {
        return data[p1] ? data[p1] : `{${p1}}`;
      });
    },
    // Replace arrays of length 1 with its content
    cut1ArrayJson: function (object) {
      if (object instanceof Array && object.length === 1) {
        return app.utils.cut1ArrayJson(object[0]);
      }
      if (object instanceof Array) {
        const cutArray = [];
        object.forEach((item) => {
          cutArray.push(app.utils.cut1ArrayJson(item));
        });
        return cutArray;
      }
      if (object instanceof Object) {
        for (const item in object)
          object[item] = app.utils.cut1ArrayJson(object[item]);
      }
      return object;
    },
    getValue: function (data, path) {
      if (!path) return data;

      path = path.split(".");

      for (let pos = 0; typeof data !== "undefined" && pos < path.length; pos++)
        data = data[path[pos]];

      return data;
    },
    // Generate unique ID
    generateGUID: function () {
      function S4() {
        // eslint-disable-next-line no-bitwise
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
      }
      return S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4();
    },
    getStackTrace: function (row) {
      const obj = {};
      Error.captureStackTrace(obj, app.utils.getStackTrace);
      if (row) return obj.stack.split("\n")[row].replace("   at ", "");
      return obj.stack;
    },
  };
};
