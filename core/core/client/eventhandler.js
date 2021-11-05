// obj instanceof Promise

const getStackTrace = (row) => {
  const obj = {};
  if (!Error.captureStackTrace) return;
  Error.captureStackTrace(obj, getStackTrace);
  if (row === 3) console.log(obj.stack.split("\n"));
  const [, source, line, column] =
    /https?:\/\/[^/]+\/([^:]+):([^:]+):([0-9]+)/im.exec(
      obj.stack.split("\n")[row]
    ) || [];

  return !source
    ? obj.stack.split("\n")[row]
    : translate(`${source} ${line}:${column}`);
};

let translate = (str) => str;

if (
  typeof window !== "undefined" &&
  window.location.host.includes("localhost")
) {
  const addScript = (src) =>
    new Promise((resolve) => {
      if (
        [...document.head.children].some(
          (child) => child.getAttribute("src") === src
        )
      ) {
        resolve();
        return;
      }

      const scriptEl = document.createElement("script");

      scriptEl.setAttribute("src", src);
      scriptEl.onload = resolve;
      document.head.appendChild(scriptEl);
    });

  addScript("/source-map.js").then(async () => {
    window.sourceMap.SourceMapConsumer.initialize({
      "lib/mappings.wasm": "/mappings.wasm",
    });
    try {
      const consumer = await new window.sourceMap.SourceMapConsumer(
        await fetch("/static/js/main.chunk.js.map").then((res) => res.json())
      );
      translate = (str) => {
        if (!str || !str.includes(":")) return str;

        let [source, line, column] = str.split(/[ :]/);

        ({ source, line, column } = consumer.originalPositionFor({
          line: parseInt(line, 10),
          column: parseInt(column, 10),
        }));
        return `${source} ${line}:${column}`;
      };
      // eslint-disable-next-line no-empty
    } catch (e) {}
  });
}

if (typeof window !== "undefined") window.addEventHandlers = {};

module.exports = function addEventHandler(context, mapevents, name) {
  const callbacks = {};
  const callbacksprio = {};
  const callbacksStack = {};
  if (typeof mapevents === "string") {
    name = mapevents;
    mapevents = undefined;
  }

  callbacksStack.addEventHandlerInitiator = [
    `${name} ${Math.random()}`,
    getStackTrace(2),
  ];

  setTimeout(() => {
    if (typeof window !== "undefined") {
      Object.entries(callbacksStack).forEach(([key, value]) => {
        callbacksStack[key] = value.map((item) => translate(item));
      });

      window.addEventHandlers[callbacksStack.addEventHandlerInitiator[0]] =
        callbacksStack;
    }
  }, 1000);

  context = context || {};

  const addEvent = (event, callback, prio) => {
    if (typeof callback === "number") {
      const tmp = callback;
      callback = prio;
      prio = tmp;
    }

    if (!callback) return console.error("No callback", getStackTrace(5));
    if (typeof callback !== "function")
      return console.error("Not a function", getStackTrace(5), callback);

    prio = prio || 0;

    if (!callbacks[event]) {
      callbacks[event] = [];
      callbacksprio[event] = [];
      callbacksStack[event] = [];
    }

    let pos = callbacks[event].length;
    while (pos && callbacksprio[event][pos - 1] < prio) pos--;

    callbacksprio[event].splice(pos, 0, prio);
    callbacks[event].splice(pos, 0, callback);
    callbacksStack[event].splice(pos, 0, getStackTrace(5));
  };

  context.on = (event, callback, prio) => {
    event = event instanceof Array ? event : [event];
    event.forEach((event) => addEvent(event, callback, prio));
  };

  const removeEvent = (event, callback) => {
    if (!callbacks[event]) {
      console.log("Missing event", event, callbacks);
      return;
    }
    const pos = callbacks[event].indexOf(callback);
    if (pos !== -1) {
      callbacks[event].splice(pos, 1);
      callbacksprio[event].splice(pos, 1);
      callbacksStack[event].splice(pos, 1);
    }

    if (!callbacks[event].length) delete callbacks[event];
  };

  context.off = (event, callback) => {
    event = event instanceof Array ? event : [event];
    event.forEach((event) => removeEvent(event, callback));
  };

  const fired = {};
  const doEvent = (event, data) => {
    data = data || {};
    const callback = callbacks[event];

    if (!callback) return Promise.resolve(data);
    if (!fired[event]) fired[event] = true;

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        console.log(
          event,
          " Stopped at",
          pos,
          callback.length,
          Object.keys(context),
          callbacksStack[event][pos - 1],
          callbacksStack[event]
        );
      }, 5000);
      let pos = 0;
      let oldData = data;

      const next = (data) => {
        if (data instanceof Promise) {
          data.then(next).catch(reject);
          return;
        }

        data = typeof data === "undefined" ? oldData : data;

        if (pos >= callback.length) {
          clearTimeout(timer);
          resolve(data);
          return;
        }

        oldData = data;
        Promise.resolve(callback[pos++](data))
          .then(next)
          .catch(reject);
      };
      next(data);
    });
  };
  context.event = doEvent;

  context.waitFor = (event) => {
    if (fired[event]) return;

    return new Promise((resolve) => {
      context.on(event, () => {
        resolve();
      });
    });
  };

  if (mapevents)
    mapevents.forEach((event) => {
      context[event] = (data, defectiveCallback) => {
        if (defectiveCallback) debugger;
        return doEvent(event, data);
      };
    });

  return context;
};
