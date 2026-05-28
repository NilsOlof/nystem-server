export default async (app) => {
  if (app.settings.debugEvLog) await app.require("./debug/debugEvLog.js");
};
