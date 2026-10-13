import httpsfallback from "./httpsfallback";
import devtools from "./devtools";

export default (app) => {
  if (!app.settings.domain) return;
  app.connection = app.addeventhandler({}, ["emit", "broadcast"], "connection");
  const { connection } = app;
  let socket;
  let lastMessage;
  connection.state = () => ({
    readyState: socket?.readyState,
    reconnect: timer === -1 ? "opening" : timer ? "scheduled" : "idle",
    lastMessage,
  });

  connection.on("broadcast", (data) => connection.emit({ ...data, broadcast: true }));

  const callbacks = {};
  const emitSocket = (callback) => (data) =>
    new Promise((resolve) => {
      if (!data.noCallback) {
        data.callbackClient = app.uuid();
        callbacks[data.callbackClient] = resolve;
      } else resolve();

      callback(new Array(JSON.stringify(data)));
    });

  let res = "";
  const receiveSocket = (message) => {
    lastMessage = Date.now();
    message = res + message;
    res = "";

    try {
      const data = JSON.parse(message);

      if (callbacks[data.callbackClient]) {
        try {
          callbacks[data.callbackClient](data);
        } catch (e) {
          console.log("err", callbacks[data.callbackClient], e);
        }
        delete callbacks[data.callbackClient];
      } else connection.event(data.type, data);
    } catch (e) {
      throw new Error(`Connection msg error ${message.length}`);
    }
  };

  const openconnection = () => {
    clearTimeout(timer);
    if (socket && socket.readyState < 2) return;
    timer = -1;
    let connectionCheck = false;
    let closed = false;
    const sendSocket = emitSocket((message) => webSocket.send(message));

    const webSocket = new WebSocket(url);
    socket = webSocket;
    app.event("clientLog", { message: "Socket opening" });

    const openingTimeout = setTimeout(() => {
      app.event("clientLog", { message: "Socket opening timed out" });
      webSocket.onerror(new Error("Socket opening timed out"));
    }, 15000);

    const closeconnection = (error) => {
      if (closed) return;
      closed = true;
      clearTimeout(openingTimeout);
      clearInterval(connectionCheck);
      if (connectionCheck) connection.off("emit", sendSocket);
      if (timer === -1) timer = false;
      webSocket.close();
      connection.event("connection", { error, connected: false });
      if (error) connection.event("error", { error });
    };

    webSocket.onerror = (error) => {
      if (closed) return;
      app.event("clientLog", { message: "Socket error" });
      closeconnection(error);
    };
    webSocket.onclose = ({ code, reason, wasClean }) => {
      app.event("clientLog", { message: "Socket closed", code, reason, wasClean });
      closeconnection();
    };

    webSocket.onopen = () => {
      if (closed) return;
      clearTimeout(openingTimeout);
      clearTimeout(timer);
      app.event("clientLog", { message: "Socket open" });
      timer = false;
      connection.on("emit", sendSocket);

      connection.event("connection", { connected: true });
      connectionCheck = setInterval(() => webSocket.send("{}"), 15000);
    };

    webSocket.onmessage = (message) => {
      if (!closed) receiveSocket(message.data);
    };
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
    if (typeof query.connected === "undefined") query.connected = connection.connected;

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

  if (app.settings.waitOnConnect) app.on("loaded", 1000, () => connection.event("connection", { wait: true }));

  if (app.settings.debug) {
    let state = "notconnected";
    let reloadPending = false;
    connection.on("connection", ({ connected, fallback }) => {
      if (fallback) return;

      if (state === "disconnected" && connected && !reloadPending) {
        reloadPending = true;
        setTimeout(() => window.location.reload(), 0);
      }
      if (connected) state = "connected";
      else if (state === "connected") state = "disconnected";
    });
  }

  httpsfallback(app);
  devtools(app);

  const { classList } = document.body;
  classList.add("offline");
  connection.on("connection", ({ connected }) => {
    if (connected && classList.contains("offline")) classList.remove("offline");
    if (!connected && !classList.contains("offline")) classList.add("offline");
  });
};
