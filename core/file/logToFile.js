const hookWritestream = (stream, callback) => {
  var old_write = stream.write;

  stream.write = (function (write) {
    return function (string, encoding, fd) {
      write.apply(stream, arguments);
      callback(string, encoding, fd);
    };
  })(stream.write);

  return () => {
    stream.write = old_write;
  };
};

module.exports = (app) => {
  if (!app.settings.logToFile) return;

  var writeStream = app.fs.createWriteStream(app.settings.logToFile);
  hookWritestream(process.stdout, (data) => writeStream.write(data));
  hookWritestream(process.stderr, (data) => writeStream.write(data));
};
