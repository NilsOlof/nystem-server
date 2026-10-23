import httpsfallback from "./httpsfallback";
import devtools from "./devtools";

export default (app) => {
  if (!app.settings.domain) return;
  app.connection = app.addeventhandler({}, ["emit", "broadcast"], "connection");
  const { connection } = app;
  let socket;
  let lastMessage;
  let probe;
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
        callbacks[data.callbackClient] = { resolve, type: data.type };
      } else resolve();

      callback(new Array(JSON.stringify(data)));
    });

  let res = "";
  const receiveSocket = (message) => {
    lastMessage = Date.now();
    message = res + message;
    res = "";
    if (message === "{}") return;

    try {
      const data = JSON.parse(message);

      if (callbacks[data.callbackClient]) {
        try {
          callbacks[data.callbackClient].resolve(data);
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
    let stableTimer;
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
      clearTimeout(stableTimer);
      clearInterval(connectionCheck);
      webSocket.close();
      if (timer === -1) timer = false;
      if (!timer) setOpenTimer(0, Math.min(60, delay * 2 || add));
      if (connectionCheck) {
        connection.off("emit", sendSocket);
        Object.entries(callbacks).forEach(([callbackClient, { resolve, type }]) => {
          delete callbacks[callbackClient];
          resolve({ type, error: "Connection lost", offline: true });
        });
        connection.event("connection", { error, connected: false });
      }
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
      stableTimer = setTimeout(() => (delay = 0), 30000);
      lastMessage = Date.now();
      connection.on("emit", sendSocket);

      connection.event("connection", { connected: true });
      let pingSent = 0;
      let buffered = 0;
      connectionCheck = setInterval(() => {
        if (lastMessage < pingSent) {
          if (Date.now() - pingSent < 30000 || webSocket.bufferedAmount < buffered) {
            buffered = webSocket.bufferedAmount;
            return;
          }
          app.event("clientLog", { message: "Socket heartbeat timed out" });
          webSocket.onerror(new Error("Socket heartbeat timed out"));
          return;
        }
        pingSent = Date.now();
        buffered = webSocket.bufferedAmount;
        webSocket.send("{}");
      }, 15000);

      probe = () => {
        const sent = Date.now();
        const probeBuffered = webSocket.bufferedAmount;
        webSocket.send("{}");
        setTimeout(() => {
          if (lastMessage >= sent || webSocket.bufferedAmount < probeBuffered) return;
          app.event("clientLog", { message: "Socket probe timed out" });
          webSocket.onerror(new Error("Socket probe timed out"));
        }, 3000);
      };
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
    if (socket?.readyState === WebSocket.OPEN || document.visibilityState !== "visible") return;
    if (timer === -1) return app.event("clientLog", { message: "Reconnect skipped, socket still opening" });

    delay = setDelay;
    const wait = delay ? 500 * delay * (1 + Math.random()) : 300;
    app.event("clientLog", { message: `Reconnect in ${Math.round(wait / 100) / 10}s` });
    clearTimeout(timer);
    timer = setTimeout(openconnection, wait);
  };

  const wake = (e) => {
    if (document.visibilityState !== "visible") return;
    if (socket?.readyState === WebSocket.OPEN) probe();
    else setOpenTimer(e);
  };

  document.addEventListener("visibilitychange", wake);
  ["focus", "pageshow", "online", "offline"].forEach((event) => window.addEventListener(event, wake));

  let networkType = navigator.connection?.type;
  navigator.connection?.addEventListener("change", (e) => {
    if (navigator.connection.type === networkType) return;
    networkType = navigator.connection.type;
    wake(e);
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

  httpsfallback(app);
  devtools(app);

  const { classList } = document.body;
  classList.add("offline");
  connection.on("connection", ({ connected }) => {
    if (connected && classList.contains("offline")) classList.remove("offline");
    if (!connected && !classList.contains("offline")) classList.add("offline");
  });
};
