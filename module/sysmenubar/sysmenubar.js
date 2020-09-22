module.exports = function(app) {
  if (app.settings.sysmenubar)
    setTimeout(function() {
      require("child_process").exec(
        "electron app.js",
        {
          cwd: app.__dirname + "/module/sysmenubar",
          env: (function() {
            process.env.NODE_PATH = app.__dirname + "/node_modules";
            return process.env;
          })()
        },
        function(error, stdout, stderr) {
          if (error) {
            console.error(`exec error: ${error}`);
            return;
          }
          console.log(`stdout: ${stdout}`);
          console.log(`stderr: ${stderr}`);
        }
      );
    });
};
