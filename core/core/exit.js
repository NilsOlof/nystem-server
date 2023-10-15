const formatBytes = (a, b = 2) => {
  if (a === 0) return "0 Bytes";
  const c = b < 0 ? 0 : b;
  const d = Math.floor(Math.log(a) / Math.log(1024));
  // eslint-disable-next-line no-restricted-properties
  return `${parseFloat((a / Math.pow(1024, d)).toFixed(c))} ${
    ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][d]
  }`;
};

module.exports = (app) => {
  process.stdin.resume();
  process.stdin.on("data", async (data) => {
    if (data.toString() !== "exit") return;
    app.event("exit");
  });

  app.on("exit", -10000, async () => {
    updateData();
    console.log(`Process exit, ${prg}`);
    await app.delay(1000);
    process.exitCode = 0;
  });

  process.on("unhandledRejection", ({ stack, message }) => {
    stack = stack || message || "Unknown error";
    console.log(`💥 Rejection ${stack.toString().replace(/\n/g, "")}`);
  });

  let prg = "";
  const updateData = () => {
    prg = Object.entries(process.memoryUsage())
      .map(([key, val]) => `${key} ${formatBytes(val)}`)
      .join(", ");
  };

  setInterval(updateData, 60000);
  updateData();

  function exitRouter(options, exitCode) {
    if (exitCode || exitCode === 0)
      console.log(`Process exit ${exitCode}, ${prg}`);
    process.exitCode = 0;
  }

  const ev = [`SIGINT`, `SIGUSR1`, `SIGUSR2`, `SIGTERM`];
  ev.forEach((eventType) => process.on(eventType, exitRouter));

  process.on(`uncaughtException`, (e) => {
    console.log(`💥 Exception ${e.stack.toString().replace(/\n/g, "")}`);
  });

  app.on("start", () => {
    app.connection.on("exitserver", async (query) => {
      app.session.add(query);
      if (query.session.role !== "super") return;

      const { exitservertoken } = app.settings;
      if (exitservertoken && exitservertoken !== query.value.name) return;

      console.log("Exitserver event");
      app.event("exit");
    });
  });
};
