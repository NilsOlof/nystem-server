// eslint-disable-next-line import/extensions
import indexScripts from "../../../indexScripts";
import contentType from "../../../contentype.json";
import addeventhandler from "./eventhandler";
import utils from "./utils";
import buildsettings from "../../../settings.json";

const settings = (window && window.___settings___) || buildsettings;
const app = { settings, contentType, addeventhandler };

if (app.settings.fetchDomainFromUrl) {
  const { protocol, host } = (window && window.location) || {};
  if (protocol === "https:" && !app.settings.secure) {
    app.settings.secure = true;
    app.settings.domain = host;
  }
}

addeventhandler(app, "app");
utils(app);
app.uuid = app.utils.uuid;
indexScripts(app);
app.capFirst = app.utils.capFirst;

app.on("init", () => {
  app.inited = true;
});

export default () => app;
app.event("init").then(() => app.event("start"));
