module.exports = function(app) {
  if (!app.fs.existsSync(`${app.__dirname}/web`)) return;
  require("./files")(app);
  require("./compile")(app);
};
