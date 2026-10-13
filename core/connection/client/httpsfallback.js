export default (app) => {
  const url = new URL(
    "/httpsfallback",
    window.location.protocol === "chrome-extension:"
      ? `http${app.settings.secure ? "s" : ""}://${app.settings.domain}`
      : window.location.origin,
  ).href;
  const onEmit = async (body) => {
    const response = await fetch(url, { method: "post", credentials: "include", body: JSON.stringify(body) }).catch(
      (error) => {
        app.event("clientLog", { message: "Fallback request failed", type: body.type, error: error.message });
        throw error;
      },
    );

    const data = await response.json();

    app.connection.event(data.type, data);
    return data;
  };

  let state = "notconnected";
  app.connection.on("connection", ({ connected, fallback }) => {
    if (!connected || fallback) return;

    if (state === "fallback") app.connection.off("emit", onEmit);
    state = "connected";
  });

  app.connection.on("error", async () => {
    if (state === "connected" || state === "fallback") return;
    state = "fallback";
    app.event("clientLog", { message: "Trying HTTPS fallback" });

    try {
      const response = await fetch(url, { method: "post", credentials: "include", body: "{}" });
      if ((await response.text()) !== "{}" || state !== "fallback") {
        if (state === "fallback") state = "notconnected";
        return app.event("clientLog", { message: "HTTPS fallback unavailable" });
      }

      app.connection.on("emit", onEmit);
      app.connection.event("connection", { connected: true, fallback: true });
    } catch (error) {
      if (state === "fallback") state = "notconnected";
      app.event("clientLog", { message: "HTTPS fallback unavailable", error: error.message });
    }
  });
};
