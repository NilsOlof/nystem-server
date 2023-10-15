module.exports = (app) => {
  const onEmit = async (body) => {
    const response = await fetch("/httpsfallback", {
      method: "post",
      body: JSON.stringify(body),
    });

    const data = await response.json();

    app.connection.event(data.type, data);
    return data;
  };

  let state = "notconnected";
  app.connection.on("connection", ({ connected, fallback }) => {
    if (!connected || fallback) return;

    if (state === "fallback") app.connection.off("sendSocket", onEmit);
    state = "connected";
  });

  app.connection.on("error", async () => {
    if (state === "connected" || state === "fallback") return;
    state = "fallback";

    const response = await fetch("/httpsfallback", {
      method: "post",
      body: "{}",
    });

    if ((await response.text()) !== "{}") return;

    app.connection.on("emit", onEmit);
    app.connection.event("connection", { connected: true, fallback: true });
  });
};
