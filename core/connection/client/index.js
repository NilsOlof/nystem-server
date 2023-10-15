const httpsfallbackM = require("./httpsfallback");
const devtoolsM = require("./devtools");

module.exports = (app) => {
  if (!app.settings.domain) return;
  app.connection = app.addeventhandler({}, ["emit", "broadcast"], "connection");
  const { connection } = app;

  connection.on("broadcast", (data) =>
    connection.emit({ ...data, broadcast: true })
  );

  const callbacks = {};
  const emitSocket = (callback) => (data) =>
    new Promise((resolve) => {
      if (!data.noCallback) {
        data.callbackClient = app.uuid();
        callbacks[data.callbackClient] = resolve;
      } else resolve();

      let message = JSON.stringify(data);

      while (message.length > 64000) {
        callback(message.substring(0, 64000));
        message = message.substring(64000);
      }
      callback(message);
    });

  let res = "";
  const receiveSocket = (message) => {
    if (message.length === 64000) {
      res += message;
      return;
    }
    message = res + message;
    res = "";

    const data = JSON.parse(message);

    if (callbacks[data.callbackClient]) {
      try {
        callbacks[data.callbackClient](data);
      } catch (e) {
        console.log("err", callbacks[data.callbackClient], e);
      }
      delete callbacks[data.callbackClient];
    } else connection.event(data.type, data);
  };

  const openconnection = () => {
    timer = -1;
    let connectionCheck = false;
    let isError = false;
    const sendSocket = emitSocket((message) => webSocket.send(message));

    const webSocket = new WebSocket(url);

    webSocket.onerror = (error) => {
      isError = true;
      timer = false;
      connection.event("connection", { error, connected: false });
      connection.event("error", { error });
    };
    webSocket.onclose = () => {
      timer = false;
      if (!isError) connection.event("connection", { connected: false });
      if (!connectionCheck) return;
      clearInterval(connectionCheck);
      connection.off("emit", sendSocket);
    };

    webSocket.onopen = () => {
      timer = false;
      connection.on("emit", sendSocket);

      connection.event("connection", { connected: true });
      connectionCheck = setInterval(() => webSocket.send("{}"), 15000);
    };

    webSocket.onmessage = (message) => receiveSocket(message.data);
  };

  const url = `ws${app.settings.secure ? "s" : ""}://${app.settings.domain}`;
  let delay = 0;
  let timer;
  const add = app.settings.debug ? 1 : 3;

  const setOpenTimer = (e, setDelay = 0) => {
    if (connection.connected || document.visibilityState !== "visible") return;
    if (timer === -1) return;

    delay = setDelay;
    clearTimeout(timer);
    timer = setTimeout(openconnection, 1000 * delay || 300);
  };

  document.addEventListener("visibilitychange", setOpenTimer);
  window.addEventListener("focus", setOpenTimer);

  connection.on("connection", ({ connected, fallback }) => {
    if (fallback) return;
    if (connected === true && delay !== 0) delay = 0;
    if (connected !== false || timer) return;

    setOpenTimer(0, delay > 50 ? delay : delay + add);
  });
  openconnection();

  connection.connected = false;
  connection.on("connection", 100, (query) => {
    if (typeof query.connected === "undefined")
      query.connected = connection.connected;

    connection.connected = query.connected;
  });

  connection.on("connection", ({ wait, connected }) => {
    if (!wait || connected) return;

    return new Promise((resolve) => {
      const onConnect = ({ connected }) => {
        if (!connected) return;
        connection.off("connection", onConnect);
        resolve({ connected: true });
      };
      connection.on("connection", onConnect);
    });
  });

  if (app.settings.waitOnConnect)
    app.on("loaded", 1000, () =>
      connection.event("connection", { wait: true })
    );

  if (app.settings.debug) {
    let state = "notconnected";
    connection.on("connection", ({ connected, fallback }) => {
      if (fallback) return;

      if (state === "disconnected" && connected) window.location.reload();
      if (state === "connected" && !connected) state = "disconnected";
      if (state === "notconnected" && connected) state = "connected";
    });
  }

  httpsfallbackM(app);
  devtoolsM(app);

  const { classList } = document.body;
  classList.add("offline");
  connection.on("connection", ({ connected }) => {
    if (connected && classList.contains("offline")) classList.remove("offline");
    if (!connected && !classList.contains("offline")) classList.add("offline");
  });
};
