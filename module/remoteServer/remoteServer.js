module.exports = function (app) {
  const ssh2 = require("ssh2").Client;
  const { fs } = app;
  let atHost = false;

  app.on("atHostLoaded", (setAtHost) => {
    atHost = setAtHost;
  });

  function addDefault(server) {
    const sshHost = {};
    sshHost.port = server.port ? server.port : 22;
    sshHost.host = server.host ? server.host : "127.0.0.1";
    sshHost.username = server.username ? server.username : "vagrent";
    sshHost.userName = server.username ? server.username : "vagrent";
    sshHost.password = server.password ? server.password : "vagrent";

    if (server.ssh && atHost.folders[server.sshName ? server.sshName : "ssh"]) {
      sshHost.privateKey = require("fs").readFileSync(
        atHost.folders[server.sshName ? server.sshName : "ssh"]
      );
      if (server.sshPassword) sshHost.passPhrase = server.sshPassword;
    }
    return sshHost;
  }

  app.connection.on("remoteServer", (data) => {
    if (!data.server) return;
    if (data.event === "log") {
      data.log = servers[data.server._id];
      app.connection.emit(data);
    }
    if (data.event == "custom") {
      let command = commands;
      const inCommand = data.command.split(".");
      for (let i = 0; i < inCommand.length; i++)
        command = command[inCommand[i]];

      command(data.server, (response) => {
        app.connection.broadcast({
          type: "remoteServer",
          event: "lastRemoteLog",
          server: data.server._id,
          log: response,
        });

        data.response = response;
        app.connection.emit(data);
      });
    }

    if (data.event == "git")
      doCommand(
        data.server,
        data.commands,
        (command, text) => {
          app.connection.emit({
            id: data.id,
            type: "remoteServer",
            server: data.server._id,
            event: data.event,
            text: text,
            command: command,
          });
        },
        (text) => {
          data.text = text;
          app.connection.emit(data);
        }
      );
  });

  var servers = {};
  function doCommand(server, commands, onCommandCallback, onEndCallback) {
    if (!onEndCallback) {
      onEndCallback = onCommandCallback;
      onCommandCallback = function () {};
    }

    if (typeof commands === "string") commands = [commands];

    if (!server.username) {
      console.log(server);
      return;
    }
    const sshHost = addDefault(server);

    for (let i = 0; i < commands.length; i++)
      commands[i] = app.utils.insertValues(commands[i], server);
    const fromCommands = JSON.parse(JSON.stringify(commands));
    console.log({ commands });
    const SSH2Shell = require("ssh2shell");
    const SSH = new SSH2Shell({
      server: sshHost,
      commands: commands,
      onCommandComplete: function (command, response, sshObj) {
        onCommandCallback(
          command != "stream.end()" ? command : fromCommands[0],
          response
        );
        if (!servers[server._id])
          servers[server._id] = {
            log: "",
          };
        const len = servers[server._id].log.length;
        if (len > 10000)
          servers[server._id].log = servers[server._id].log.substring(
            len - 10000
          );
        servers[server._id].log += `\n${response}`;
      },
      onEnd: function (sessionText, sshObj) {
        if (onEndCallback) onEndCallback(sessionText);
      },
    });
    SSH.on("commandProcessing", (command, response, sshObj, stream) => {
      const responsRows = response.split("\n");
      console.log(`command: ${command}\n`);
      if (
        server.repoPassword &&
        responsRows[responsRows.length - 1].indexOf("Password for 'https://") ==
          0
      )
        stream.write(`${server.repoPassword}\n`);
    });
    SSH.connect();
  }

  function sftp(server, direction, from, to, callback) {
    from = app.utils.insertValues(from, server);
    to = app.utils.insertValues(to, server);

    function upload() {
      console.log(from, to);
      conn.sftp((err, sftp) => {
        if (err) {
          callback("Error, problem starting SFTP: %s", err);
          return;
        }

        callback("- SFTP started");

        // upload file
        const readStream = fs.createReadStream(from);
        const writeStream = sftp.createWriteStream(to);

        // what to do when transfer finishes
        writeStream.on("close", () => {
          callback("- file transferred");
          sftp.end();
        });

        // initiate transfer of file
        readStream.pipe(writeStream);
      });
    }
    function download() {
      console.log(from, to);
      conn.sftp((err, sftp) => {
        if (err) {
          callback("Error, problem starting SFTP: %s", err);
          return;
        }

        callback("- SFTP started");

        // upload file
        const readStream = sftp.createReadStream(from);
        const writeStream = fs.createWriteStream(to);

        // what to do when transfer finishes
        writeStream.on("close", () => {
          callback("- file transferred");
          sftp.end();
        });

        // initiate transfer of file
        readStream.pipe(writeStream);
      });
    }

    var conn = new ssh2();
    const sshHost = addDefault(server);

    conn
      .on("ready", direction == "download" ? download : upload)
      .connect(sshHost);

    conn.on("error", (err) => {
      callback(`Connect error${err.toString()}`);
    });

    conn.on("close", (err) => {});
  }

  const settings = JSON.parse(
    app.fs.readFileSync(`${__dirname}/settings.json`)
  );
  var commands = require("./commands.js")(app, settings, doCommand, sftp);
};

/*
 *
First time
http://cubik-tech.blogspot.se/2013/02/raspberry-pi-emulation-on-windows.html

qemu-system-armw.exe -M versatilepb -m 256 -cpu arm1176 -no-reboot -serial stdio -kernel kernel-qemu -hda raspbian.img -append "root=/dev/sda2 panic=1 rootfstype=ext4 rw init=/bin/bash"


Using nano create a new file:

nano /etc/udev/rules.d/90-qemu.rules

Add the following text to the file:

KERNEL=="sda", SYMLINK+="mmcblk0"
KERNEL=="sda?", SYMLINK+="mmcblk0p%n"
KERNEL=="sda2", SYMLINK+="root"

- Save the file and exit nano.

Close QEMU by typing Exit and pressing Enter.


E:\downloads\Qemu-2.4.0-windows\Qemu-windows-2.4.0>
qemu-system-armw.exe -M versatilepb -m 256 -cpu arm1176 -no-reboot -serial stdio -kernel kernel-qemu -hda raspbian.img -append "root=/dev/sda2 panic=1 rootfstype=ext4 rw" -redir tcp:2222::2
2
var host = {
		server: {
			host:         "IP Address",
			port:         "external port number",
			userName:     "user name",
			password:     "user password",
			passPhrase:   "privateKeyPassphrase", //optional default:""
			privateKey:   require('fs').readFileSync('/path/to/private/key/id_rsa'), //optional default:""
		},
		hosts:               [Array, of, nested, host, configs, objects], //optional default:[]
		standardPrompt:     "$%#>",//optional default:"$#>"
		passwordPrompt:     ":",//optional default:":"
		passphrasePrompt:   ":",//optional default:":"
		commands:            ["Array", "of", "command", "strings"],
		msg:                 {
			send: function( message ) {
				//message handler code
			}
		},

		//optional event handlers defined for a host that will be called by the default event handlers
		//of the class
		onCommandProcessing: function( command, response, sshObj, stream ) {
		 //optional code to run during the procesing of a command
		 //command is the command being run
		 //response is the text buffer that is still being loaded with each data event
		 //sshObj is this object and gives access to the current set of commands
		 //stream object allows strea.write access if a command requires a response
		},
		onCommandComplete:   function( command, response, sshObj ) {
		 //optional code to run on the completion of a command
		 //response is the full response from the command completed
		 //sshObj is this object and gives access to the current set of commands
		},
		onCommandTimeout:    function(command, response, sshObj, stream, connection) {
		 //optional code for responding to command timeout
		 //response is the text response from the command up to it timing out
		 //stream object used  to respond to the timeout without having to close the connection
		 //connection object gives access to close the shell using connection.end()
		},
		onEnd:               function( sessionText, sshObj ) {
		 //optional code to run at the end of the session
		 //sessionText is the full text for this hosts session
		}
	};
*/
