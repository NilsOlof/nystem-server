const { exec } = require("child_process");

module.exports = (options) => {
  exec(
    options.command,
    options.path ? { cwd: options.path } : undefined,
    (error, stdout, stderr) => {
      if (error) console.log(error);
      else options.callback(stdout, stderr);
    }
  );
};
