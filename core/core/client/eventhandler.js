const getStackTrace = (row) => {
  const obj = {};
  if (!Error.captureStackTrace) return "";
  Error.captureStackTrace(obj, getStackTrace);

  const [, source, line, column] =
    /https?:\/\/[^/]+\/([^:]+):([^:]+):([0-9]+)/im.exec(
      obj.stack.split("\n")[row]
    ) || [];

  return !source
    ? obj.stack.split("\n")[row]
    : ` ${source}:${line}:${column}\n`;
};

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

  const printStack = (text) =>
    text && text.replace("   at module.exports ", "at ");

  const fired = {};
  const doEvent = (event, data) => {
    data = data || {};
    const callback = callbacks[event];

    if (!fired[event]) fired[event] = true;
    if (!callback) return Promise.resolve(data);

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        console.log(
          `💥 Event ${event} stopped ${pos} of ${callback.length}${printStack(
            callbacksStack[event][pos - 1]
          )}  ${callbacksStack[event]
            .map((item, index) => `${index}.${printStack(item)}`)
            .join("  ")}`
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

  context.waitFor = (event) =>
    new Promise((resolve) => {
      const call = () => {
        context.off(event, call);
        resolve();
      };

      if (fired[event]) resolve();
      else context.on(event, call);
    });

  if (mapevents)
    mapevents.forEach((event) => {
      context[event] = (data, defectiveCallback) => {
        // if (defectiveCallback) debugger;
        return doEvent(event, data);
      };
    });

  return context;
};
