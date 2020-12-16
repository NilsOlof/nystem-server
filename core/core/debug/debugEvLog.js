module.exports = (app) => {
  const { fs } = app;

  const parsedDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDay()} ${d.getHours()}.${d.getMinutes()}`;
  };

  const debugEvLog = async ({
    event = "save",
    file = "/files/log/{date}.log",
    timeout = 10000,
    limit = 100,
    evHandler,
    prio = 0,
    add = {},
    remove = [],
    first,
  }) => {
    const filename = app.__dirname + file.replace("{date}", parsedDate());
    await fs.ensureFile(filename);

    const cleanUp = (limit) => {
      if (limit > 0) return;

      evHandler.off(event, write);
      clearTimeout(timer);
    };
    const timer = setTimeout(cleanUp, timeout);

    const write = async (query) => {
      let data = { ...add, ...query };

      remove.forEach((key) => {
        const path = key.split(".");
        if (path.length === 2)
          data = {
            ...data,
            [path[0]]: { ...data[path[0]], [path[1]]: undefined },
          };
        else data = { ...data, [path[0]]: undefined };
      });

      await fs.appendFile(filename, `${JSON.stringify(data)}\n`);
      cleanUp(--limit);
    };
    if (first) write(first);

    evHandler.on(event, prio, write);
  };

  app.on("debugEvLog", debugEvLog);
};
