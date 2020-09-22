var net = require("net");
var commandSeparator = process.argv[3];
var port = process.argv[2];
var started = false;

function isFunction(obj) {
  return !!(obj && obj.constructor && obj.call && obj.apply);
}

net
  .createServer(function(socket) {
    if (started) {
      socket.end();
      return;
    }
    started = true;
    var messageQueue = "";
    scripts = {};

    function send(data) {
      socket.write(JSON.stringify(data) + commandSeparator);
    }

    function requireScript(command) {
      var type;
      var thisScript = require(command.path);
      if (isFunction(thisScript)) type = "function";
      else if (typeof thisScript === "string") type = "string";
      else type = "object";
      send({
        id: command.id,
        command: "init",
        type: type,
        keys: Object.keys(thisScript)
      });
      var started = false;
      return function(command) {
        var args = command.args;
        var callbacks = [];
        for (var item in args) {
          if (args[item] == "<callback>")
            (function(item) {
              args[item] = function() {
                send({
                  id: command.id,
                  idCall: command.idCall,
                  type: "callback",
                  pos: item,
                  arguments: arguments
                });
              };
            })(item);
        }
        if (!started) {
          thisScript = thisScript(args[0], args[1], args[2], args[3], args[4]);
          started = true;
          return;
        }
        if (command.key)
          thisScript[command.key](args[0], args[1], args[2], args[3], args[4]);
        else
          thisScript(args[0], args[1], args[2], args[3], args[4]);
      };
    }

    socket.on("data", function(data) {
      messageQueue += data.toString();
      var commands = messageQueue.split(commandSeparator);
      for (var i = 0; commands.length > 1; i++) {
        var command = JSON.parse(commands.shift());
        if (command.command == "start")
          scripts[command.id] = requireScript(command);
        else if (scripts[command.id]) scripts[command.id](command);
      }
      messageQueue = commands[commands.length - 1];
    });

    socket.on("end", function() {
      process.end();
    });
  })
  .listen(port);
