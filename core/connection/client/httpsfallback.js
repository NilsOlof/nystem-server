export default (app) => {
  const url = new URL(
    "/httpsfallback",
    window.location.protocol === "chrome-extension:"
      ? `http${app.settings.secure ? "s" : ""}://${app.settings.domain}`
      : window.location.origin,
  ).href;
  let state = "notconnected";

  const onEmit = async (body) => {
    try {
      const response = await fetch(url, {
        method: "post",
        credentials: "include",
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30000),
      });
      const data = await response.json();

      app.connection.event(data.type, data);
      return data;
    } catch (error) {
      app.event("clientLog", { message: "Fallback request failed", type: body.type, error: error.message });
      if (state === "fallback") {
        state = "notconnected";
        app.connection.off("emit", onEmit);
        app.connection.event("connection", { connected: false, fallback: true });
      }
      return { type: body.type, error: "Connection lost", offline: true };
    }
  };

  app.connection.on("connection", 60, ({ connected, fallback }) => {
    if (!connected || fallback) return;

    if (state === "fallback") app.connection.off("emit", onEmit);
    state = "connected";
  });

  app.connection.on("error", async () => {
    if (state !== "notconnected") return;
    state = "probing";
    app.event("clientLog", { message: "Trying HTTPS fallback" });

    const available = await fetch(url, {
      method: "post",
      credentials: "include",
      body: "{}",
      signal: AbortSignal.timeout(10000),
    })
      .then(async (response) => (await response.text()) === "{}")
      .catch(() => false);

    if (state !== "probing") return;
    if (!available) {
      state = "notconnected";
      return app.event("clientLog", { message: "HTTPS fallback unavailable" });
    }

    state = "fallback";
    app.connection.on("emit", onEmit);
    app.connection.event("connection", { connected: true, fallback: true });
  });
};
