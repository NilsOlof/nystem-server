const net = require("net");

const port = 64655;
const commandSeparator = "%%%%";

const uuid = () => {
  const S4 = () =>
    // eslint-disable-next-line no-bitwise
    (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);

  return S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4();
};

const commandParser = (socket, callback) => {
  let messageQueue = "";

  socket.on("data", (data) => {
    messageQueue += data.toString();
    const commands = messageQueue.split(commandSeparator);

    commands
      .filter((command) => command)
      .forEach((command) => callback(JSON.parse(command)));

    messageQueue = commands[commands.length - 1];
  });

  socket.on("end", () => {});
  socket.on("error", (err) => {});

  return (data) => socket.write(JSON.stringify(data) + commandSeparator);
};

module.exports = {
  server: (app) => {
    const callbacks = {};

    const start = (socket) => {
      const send = commandParser(
        socket,
        async ({ id, prio, off, on, event, data, callback }) => {
          if (callback) {
            callbacks[callback](data);
            delete callbacks[callback];
            return;
          }

          if (id) {
            send({ id, event, data: await app.event(event, data) });
            return;
          }

          if (on) {
            const callback = (data) =>
              new Promise((resolve) => {
                const callback = uuid();
                send({ on, event, data, callback });
                callbacks[callback] = resolve;
              });

            app.on(event, callback, prio);
            callbacks[on] = callback;
          }

          if (off) {
            app.off(event, callbacks[off]);
            delete callbacks[off];
          }
        }
      );
    };

    net.createServer(start).listen(port);
  },

  client: (ev = {}) => {
    const callbacks = {};

    const client = net.connect({ port }, () => {});

    const send = commandParser(
      client,
      async ({ id, on, event, data, callback }) => {
        if (callback) {
          send({ callback, data: await callbacks[on](data) });
          return;
        }

        if (id) {
          callbacks[id](data);
          delete callbacks[id];
        }

        if (on) send({ on, event, data: await callbacks[on](data) });
      }
    );

    return {
      ...ev,

      on: (event, callback, prio) => {
        if (typeof callback === "number") {
          const tmp = callback;
          callback = prio;
          prio = tmp;
        }

        const on = uuid();
        callbacks[on] = callback;
        send({ on, prio, event });
      },

      event: (event, data) =>
        new Promise((resolve) => {
          const id = uuid();
          callbacks[id] = resolve;
          send({ id, event, data });
        }),

      off: (event, callback) => {
        const [id] = Object.entries(callbacks).filter(
          ([, val]) => val === callback
        );
        delete callbacks[id];
        send({ off: id });
      },
    };
  },
};
