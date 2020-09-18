import indexScripts from "../../../indexScripts";
import contentType from "../../../contentype.json";
import addeventhandler from "./eventhandler";
import utils from "./utils";
import buildsettings from "../../../settings.json";

const settings = (window && window.___settings___) || buildsettings;
const app = { settings, contentType, addeventhandler };

addeventhandler(app, "app");
utils(app);
app.uuid = app.utils.uuid;
indexScripts(app);
app.capFirst = app.utils.capFirst;

app.on("init", () => {
  app.inited = true;
});

export default () => app;
app.event("init");
