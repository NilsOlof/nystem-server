import waitInLine from "./waitInLine";
import log from "./log";

/* eslint-disable guard-for-in */
export default (app) => {
  if (!app.t) app.t = (text) => text;

  log(app);
  app.waitInLine = waitInLine;

  app.delay = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

  function init() {
    if (!document.body) {
      window.onload = init;
      return;
    }

    if (app.settings.debug) console.log(app);

    const baseURL = () => {
      const { domain, secure } = app.settings;

      return `http${secure ? "s" : ""}://${domain}/`;
    };

    app.insertVal = (val, view, path = "") =>
      val?.replace(/\{([a-z_.0-9]+)\}/gim, (str, p1) => {
        let val = "";
        if (p1 === "_language") val = app.settings.lang;
        else if (p1 === "_userid") val = app.session.user?._id;
        else if (p1 === "baseURL") val = baseURL();
        else if (p1 === "id") val = view.id;
        else if (p1 === "now") val = Date.now();
        else if (p1.indexOf("params.") === 0)
          val = view.params[p1.replace("params.", "")];
        else {
          let atView = view;
          while (p1.indexOf("baseView.") === 0) {
            p1 = p1.replace("baseView.", "");
            atView = atView.baseView;
          }
          if (p1 === "_id") val = atView.value._id;
          else val = atView.getValue(p1.replace("..", path));
        }

        if (val instanceof Array) val = val.join("|");
        return val || "";
      });

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
            oneFilterIn[i][1],
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
      false,
    );

    app.event("loaded");
  }

  app.on("init", -1000, init);
};
