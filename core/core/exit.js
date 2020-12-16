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
  process.stdin.on("data", (data) => {
    if (data.toString() !== "exit") return;
    updateData();
    console.log(`Process exit, ${prg}`);
    app.event("exit");
  });

  process.on("unhandledRejection", (r) => console.log("unhandledRejection", r)); // eslint-disable-line no-console

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
    process.exit();
  }

  const ev = [`SIGINT`, `SIGUSR1`, `SIGUSR2`, `SIGTERM`];
  ev.forEach((eventType) => process.on(eventType, exitRouter));

  process.on(`uncaughtException`, (e) => {
    console.log(`uncaughtException`, e);
  });
};
