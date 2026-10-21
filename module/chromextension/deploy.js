import buildExtension from "./build.js";

export default (app) => {
  if (app.settings.chromextension) app.on("deploy", () => buildExtension(app));
};
