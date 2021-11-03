/* eslint-disable guard-for-in */
module.exports = (app) => {
  if (!app.t) app.t = (text) => text;

  app.on("init", -1000, () => {
    app.capFirst = app.utils.capFirst;
    app.uuid = app.utils.uuid;
    app.clone = app.utils.clone;
    init();
  });

  function init() {
    if (!document.body) {
      window.onload = init;
      return;
    }

    if (app.settings.debug) console.log(app);

    app.parseFilter = (filter, getValue, path) => {
      if (!filter) return {};
      function insertVal(val) {
        return val.replace(/\{([a-z_.]+)\}/gim, (str, p1) => {
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

    app.stateStore = (() => {
      const states = {};
      return {
        set: function (obj, state, type) {
          if (type === "disabled") return;

          const url = window.location.pathname;
          const id = app.domPathId(obj.current);
          if (type === "independent") {
            states[id] = state;
            return;
          }

          if (!states[url]) states[url] = {};

          states[url][id] = state;
        },
        get: function (obj, type) {
          if (type === "disabled") return null;

          const id = app.domPathId(obj.current);
          if (type === "independent") return states[id];

          const url = window.location.pathname;

          if (!states[url] || states[url][id] === undefined) return null;
          return states[url][id];
        },
      };
    })();

    app.domPathId = (element) => {
      if (!element) return null;
      const path = [];
      for (let i = 0; i < 200 && element.parentElement; i++) {
        for (let item = 0; item < element.parentElement.children.length; item++)
          if (element.parentElement.children[item] === element)
            path.unshift(`${item}.${element.tagName}`);
        element = element.parentElement;
      }
      return path.join(".");
    };

    document.addEventListener(
      "keydown",
      (e) => {
        if (
          e.keyCode === 83 &&
          (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)
        ) {
          e.preventDefault();
          app.event("keypressSaveEvent");
        }
      },
      false
    );

    app.event("loaded");
  }
};
