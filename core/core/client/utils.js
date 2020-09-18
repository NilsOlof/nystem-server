export default (app) => {
  const translations = {};
  const lang = "";

  app.utils = {
    capFirst: function (text) {
      if (!text) return "";
      return text.substring(0, 1).toUpperCase() + text.substring(1);
    },
    contains: function (array1, array2) {
      if (typeof array1 === "string") array1 = [array1];
      if (typeof array2 === "string") array2 = [array2];

      for (let i = 0; i < array1.length; i++)
        if (array2.indexOf(array1[i]) !== -1) return true;

      return false;
    },
    t: function (text) {
      if (translations[lang] && translations[lang][text])
        return translations[lang][text];
      return text;
    },
    translate: function (text) {
      return text.replace(/t\('([^']+)'\)/g, (str, p1, offset, s) => {
        if (translations[lang] && translations[lang][p1])
          return translations[lang][p1];
        return p1;
      });
    },
    insertValues: function (text, data) {
      return text.replace(/{([a-z0-9_.]+)}/gi, (str, p1, offset, s) => {
        return data[p1] ? data[p1] : `{${p1}}`;
      });
    },
    clone: (obj) => {
      try {
        return JSON.parse(JSON.stringify(obj));
      } catch (error) {
        console.error("Clone error", obj);
        return {};
      }
    },
    uuid: () => {
      const S4 = () =>
        (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);

      function guidGenerator() {
        const buf = new Uint16Array(8);
        window.crypto.getRandomValues(buf);
        const S4 = function (num) {
          let ret = num.toString(16);
          while (ret.length < 4) {
            ret = `0${ret}`;
          }
          return ret;
        };
        return (
          S4(buf[0]) +
          S4(buf[1]) +
          S4(buf[2]) +
          S4(buf[3]).substring(1) +
          S4(buf[4]) +
          S4(buf[5]) +
          S4(buf[6]) +
          S4(buf[7])
        );
      }
      if (window.crypto && window.crypto.getRandomValues)
        return guidGenerator();
      return S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4();
    },
  };

  app.uuid = app.utils.uuid;
};
