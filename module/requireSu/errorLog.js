const fs = require("fs");

let logCb = false;

let logFile = false;

const hookStream = (stream, callback) => {
  stream.write = ((write) =>
    function (string, encoding, fd) {
      write.apply(stream, arguments);
      callback(string, encoding, fd);
    })(stream.write);
};

const log = (data) => {
  if (logCb) {
    logCb(data.toString());
    return;
  }

  if (!logFile)
    logFile = fs.createWriteStream(`${__dirname}/node.log`, {
      flags: "a",
    });

  logFile.write(data.toString(), "utf-8");
};

hookStream(process.stdout, log);
hookStream(process.stderr, log);

const exeptionParse = (cb) => (err, origin) =>
  cb(`uncaughtException: ${err}\nOrigin: ${origin}`);

process.on("uncaughtException", exeptionParse(log));
process.on("unhandledRejection", exeptionParse(log));

module.exports = (setCallback) => {
  logCb = setCallback;
};
