const hookWritestream = (stream, callback) => {
  // eslint-disable-next-line wrap-iife
  stream.write = (function (write) {
    return function (string, encoding, fd) {
      write.apply(stream, arguments);
      callback(string, encoding, fd);
    };
  })(stream.write);
};

module.exports = (app) => {
  if (!app.settings.logToFile) return;

  const writeStream = app.fs.createWriteStream(app.settings.logToFile);
  hookWritestream(process.stdout, (data) => writeStream.write(data));
  hookWritestream(process.stderr, (data) => writeStream.write(data));
};
