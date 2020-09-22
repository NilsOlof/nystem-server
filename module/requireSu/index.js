module.exports = (app) => {
  const isFunction = (obj) =>
    !!(obj && obj.constructor && obj.call && obj.apply);

  const net = require("net");
  const port = 6666;
  let client = false;
  const commandSeparator = app.uuid();
  const scripts = {};
  const callbacks = {};
  let sendQueue = [];
  let starting = false;

  const startWorker = (data) => {
    if (starting) return;
    starting = true;
    const os = require("os").platform();

    const command = `node ${__dirname}/suWorker.js ${port} ${commandSeparator}`;
    if (os === "win32")
      require("node-windows").elevate(command, {}, (error, stdout, stderr) => {
        if (error) console.error(error);
        if (stdout) console.log(stdout);
        if (stderr) console.error(stderr);
        client = true;
        startScript();
      });
    else {
      require("child_process").exec(
        `sudo ${command}`,
        {},
        (error, stdout, stderr) => {
          console.log(error, stdout, stderr);
        }
      );
      setTimeout(() => {
        client = true;
        startScript();
      }, 500);
    }
  };
  let connected = false;

  function send(data) {
    function sendOne() {
      if (!connected) {
        setTimeout(sendOne, 100);
        return;
      }
      if (!sendQueue.length) return;
      const message = sendQueue.map((item) => {
        return JSON.stringify(item);
      });
      client.write(message.join(commandSeparator) + commandSeparator);
      sendQueue = [];
    }
    if (data) sendQueue.push(data);
    sendOne();
  }
  function remoteFunction(idScript, self, key, iskey) {
    function doCall() {
      const id = app.uuid();
      for (let i = 0; i < arguments.length; i++)
        if (isFunction(arguments[i])) {
          callbacks[id + i] = arguments[i];
          arguments[i] = "<callback>";
        }
      send({
        id: idScript,
        idCall: id,
        key: key,
        args: arguments,
      });
      return iskey ? self : doCall;
    }
    return doCall;
  }

  let startTries = 0;
  function startScript(data) {
    send(data);
    if (client === false) {
      startWorker();
      return;
    }
    if (client === true) {
      client = net.connect(
        {
          port: port,
        },
        () => {
          console.log("suWorker connect");
          connected = true;
          send();
        }
      );
      let messageQueue = "";
      client.on("data", (data) => {
        messageQueue += data.toString();
        const commands = messageQueue.split(commandSeparator);
        for (let i = 0; commands.length > 1; i++) {
          const command = JSON.parse(commands.shift());
          if (command.command == "start")
            scripts[command.id] = requireScript(command);
          else if (scripts[command.id]) scripts[command.id](command);
        }
        messageQueue = commands[commands.length - 1];
      });

      client.on("end", () => {
        client = false;
        connected = false;
        console.log("suWorker end");
      });

      client.on("error", (err) => {
        client = startTries++ < 30;
        console.log("suWorker error", err);
        if (client) setTimeout(startScript, 1000);
      });
    }
  }

  app.on("requireSu", ({ path, keys }) => {
    const self = {};
    const id = app.uuid();
    for (let i = 0; keys && keys.length && i < keys.length; i++)
      self[keys[i]] = remoteFunction(id, self, keys[i]);

    scripts[id] = function (command) {
      if (command.command === "init") {
        for (let i = 0; command.keys && i < command.keys.length; i++)
          self[command.keys[i]] = remoteFunction(id, self, command.keys[i]);
      }
      if (
        command.type === "callback" &&
        callbacks[command.idCall + command.pos]
      ) {
        const args = command.arguments;
        callbacks[command.idCall + command.pos](
          args[0],
          args[1],
          args[2],
          args[3],
          args[4]
        );
      }
    };
    startScript({
      id: id,
      command: "start",
      path: path,
    });
    return remoteFunction(id, self, false, true);
  });
};
