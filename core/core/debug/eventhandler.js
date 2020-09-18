function getStackTrace(row) {
  const obj = {};
  Error.captureStackTrace(obj, getStackTrace);
  if (row) return obj.stack.split("\n")[row].replace("   at ", "");
  return obj.stack;
}

module.exports = function addEventHandler(context, mapevents) {
  setTimeout(() => {
    console.log(callers);
  }, 2000);

  const callbacks = {},
    callbacksprio = {},
    callers = {};

  context = context || {};

  context.on = (event, callback, prio) => {
    event = event instanceof Array ? event : [event];
    event.forEach(event => addEvent(event, callback, prio));
  };

  function addEvent(event, callback, prio) {
    prio = prio || 0;

    if (!callbacks[event]) {
      callbacks[event] = [];
      callbacksprio[event] = [];
      callers[event] = [];
    }

    let pos = callbacks[event].length;
    while (pos && callbacksprio[event][pos - 1] < prio) pos--;

    callbacksprio[event].splice(pos, 0, prio);
    callbacks[event].splice(pos, 0, callback);
    callers[event].splice(
      pos,
      0,
      getStackTrace(5).replace(
        __dirname.replace(/core[\\\/]server[\\\/]debug/, ""),
        ""
      )
    );
  }

  context.off = (event, callback) => {
    event = event instanceof Array ? event : [event];
    event.forEach(event => removeEvent(event, callback, prio));
  };

  function removeEvent(event, callback) {
    if (!callbacks[event]) {
      console.log("Missing event", event, callbacks);
      return;
    }
    const pos = callbacks[event].indexOf(callback);
    if (pos !== -1) {
      callbacks[event].splice(pos, 1);
      callbacksprio[event].splice(pos, 1);
      callers[event].splice(pos, 1);
    }
  }

  context.event = function(event, data, fromFunction) {
    console.log(
      "Do event ",
      event,
      data,
      getStackTrace(fromFunction ? 3 : 2).replace(
        __dirname.replace("lib", ""),
        ""
      )
    );

    data = data || {};
    const callback = callbacks[event];

    if (!callback || !callback.length) return Promise.resolve(data);

    return new Promise((resolve, reject) => {
      let pos = 0,
        oldData = data;

      function next(data) {
        if (data instanceof Promise) {
          data.then(next).catch(reject);
          return;
        }

        if (data === "{{{breakEvent}}}") {
          resolve(oldData);
          return;
        }

        let skipNext = data === "{{{skipNext}}}";

        data = skipNext || typeof data === "undefined" ? oldData : data;

        if (skipNext) pos++;

        if (pos >= callback.length) {
          console.log("Return callback ", event);
          resolve(data);
          return;
        }

        console.log("Do callback ", event, callers[event][pos]);
        oldData = data;
        Promise.resolve(callback[pos++](data)).then(next).catch(reject);
      }
      next(data);
    });
  };

  if (mapevents)
    mapevents.forEach(event => {
      context[event] = data => context.event(event, data, true);
    });

  return context;
};
