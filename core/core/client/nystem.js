// eslint-disable-next-line import/extensions
import indexScripts from "../../../indexScripts";
import contentType from "../../../contentype.json";
import addeventhandler from "./eventhandler";
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
const S4 = () =>
  // eslint-disable-next-line no-bitwise
  (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
app.uuid = () => S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4();
app.capFirst = (text) =>
  text && text.substring(0, 1).toUpperCase() + text.substring(1);
app.clone = (data) => data && JSON.parse(JSON.stringify(data));

indexScripts(app);

app.on("init", () => {
  app.inited = true;
});

export default () => app;
app.event("init").then(() => app.event("start"));
