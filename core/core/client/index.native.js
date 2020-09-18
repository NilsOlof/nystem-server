module.exports = function(app) {
  if (typeof console === "undefined") console = { log: function() {} };
  app.on("init", () => {
    app.queue = app.utils.queue;
    app.capFirst = app.utils.capFirst;
    app.uuid = app.utils.uuid;
    app.clone = app.utils.clone;
    app.t = app.t || app.utils.t;
    init();
  });

  function init() {
    app.parseFilter = function(filter, getValue, path) {
      if (!filter) return {};
      const self = this;
      function insertVal(val) {
        return val.replace(/\{([a-z_.]+)\}/gim, function(str, p1, offset, s) {
          return getValue(p1.replace("..", path));
        });
      }
      const parsedfilter = { $and: [] };

      for (const item in filter) {
        const oneFilter = {};
        const oneFilterIn = filter[item].and;
        for (const i in oneFilterIn)
          oneFilter[insertVal(oneFilterIn[i][0])] = insertVal(
            oneFilterIn[i][1]
          );
        parsedfilter.$and.push(oneFilter);
      }
      return parsedfilter;
    };

    app.stateStore = (function() {
      const states = {},
        url = Math.random();
      return {
        set: function(obj, state) {
          if (!states[url]) states[url] = {};
          const id = app.uuid();
          states[url][id] = state;
        },
        get: function(obj) {
          const id = app.uuid();
          if (!states[url]) return null;
          return states[url][id];
        }
      };
    })();

    app.event("loaded");
  }
};
