module.exports = function (app) {
  let URL = app.settings.domain;
  if (app.settings.native)
    URL = app.settings.secure ? `wss://${URL}` : `ws://${URL}`;
  else {
    if (!URL) {
      URL = window.location.href.replace("http://", "");
      URL = URL.substring(0, URL.indexOf("/"));
    }
    URL = `${
      window.location.href.indexOf("https://") !== -1 ? "wss" : "ws"
    }://${URL}`;
  }

  app.webSocket = new WebSocket(URL);
  let { webSocket } = app;
  const callbacks = {};
  let isOnline = false;
  let reconnect = false;

  let closed = false;
  let failCount = 13;
  const log = (text) => {
    if (isOnline) failCount = 0;
    if (failCount++ < 10) console.log(text);
  };

  function openconnection() {
    log(`openconnection ${URL}`);
    webSocket = webSocket || new WebSocket(URL);
    function connected() {
      isOnline = true;
      connection.event("connect", { type: "connect" });
      console.log("Connected");
      if (reconnect) window.location.reload();
      if (app.settings.debug) reconnect = true;
    }
    if (webSocket.readyState === 1) connected();
    webSocket.onopen = connected;
    webSocket.onclose = function () {
      log(`close ${URL}`);
      webSocket = false;
      isOnline = false;
      if (!closed) setTimeout(openconnection, 1000);
      connection.event("disconnect", { type: "close" });
    };
    webSocket.onerror = function (error) {
      log(`error ${URL}`);
    };
    webSocket.onmessage = function (message) {
      const data = JSON.parse(message.data);
      if (callbacks[data.callbackid]) {
        try {
          callbacks[data.callbackid](data);
        } catch (e) {
          log("err", callbacks[data.callbackid], e);
        }
        delete callbacks[data.callbackid];
      }
      connection.event(data.type, data);
    };
  }

  app.on("unmount", () => {
    closed = true;
    webSocket.close();
  });

  setInterval(() => {
    if (isOnline) webSocket.send("li");
  }, 15000);

  const connection = app.addeventhandler(
    { connected: () => isOnline },
    ["emit", "broadcast", "close"],
    "connection"
  );

  connection.on(
    "emit",
    (data) =>
      new Promise((resolve, reject) => {
        let counter = 0;
        function send() {
          if (webSocket.readyState > 0) {
            if (msg.length > 64000) {
              for (; msg.length > 64000; ) {
                webSocket.send(msg.substring(0, 64000));
                msg = msg.substring(64000);
              }
            }
            webSocket.send(msg);
            clearTimeout(data.timeout);
          } else {
            if (counter === 1 && callbacks[data.callbackid])
              callbacks[data.callbackid](
                Object.assign({}, data, { offline: true })
              );
            counter++;
            if (counter !== 300) setTimeout(send, 200);
            else {
              callbacks[data.callbackid](
                Object.assign({}, data, { timeout: true })
              );
              delete callbacks[data.callbackid];
            }
          }
        }
        if (!data.noCallback) {
          data.callbackid = app.uuid();
          callbacks[data.callbackid] = resolve;
        } else resolve();
        let msg = JSON.stringify(data);
        send();
      })
  );

  connection.on("broadcast", (data) => {
    data.broadcast = true;
    return connection.emit(data);
  });

  connection.on("close", () => {
    webSocket.close();
  });

  app.connection = connection;

  if (app.settings.waitOnConnect)
    app.on(
      "loaded",
      1000,
      () =>
        new Promise((resolve) => {
          const cont = () => {
            resolve();
            connection.off("connect", cont);
          };
          if (isOnline) resolve();
          else connection.on("connect", cont);
        })
    );
  openconnection();
};
