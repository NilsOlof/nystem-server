const {
  app: electron,
  BrowserWindow,
  ipcMain,
  screen,
  shell,
} = require("electron");
const fs = require("fs-extra");

let app = {};

if (fs.existsSync(`${__dirname}/core/core/index.js`))
  app = require(`${__dirname}/core/core`)();
else {
  app.__dirname = __dirname;
  app.fs = fs;
  app.addeventhandler = require(`${__dirname}/core/core/client/eventhandler`);
  app.addeventhandler(app);

  const S4 = () =>
    // eslint-disable-next-line no-bitwise
    (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  app.uuid = () => S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4();

  app.settings = JSON.parse(
    fs.readFileSync(`${__dirname}/data/host.json`, "utf8")
  );

  require("./scripts")(app);
  app.event("started");
}

if (require("electron-squirrel-startup")) electron.quit();

let pos = {};
const isInside = (pos, bounds) => {
  if (!pos.x || pos.width > bounds.width || pos.height > bounds.height)
    return false;
  if (pos.x + pos.width > bounds.x + bounds.width) return false;
  if (pos.y + pos.height > bounds.y + bounds.height) return false;
  if (pos.y < bounds.y || pos.x < bounds.x) return false;
  return true;
};

app.on("electronReady", async ({ pos, ...windowProps }) => {
  if (
    !screen
      .getAllDisplays()
      .map((screen) => screen.bounds)
      .find((bounds) => isInside(pos, bounds))
  )
    pos = { width: 1200, height: 700 };

  const mainWindow = new BrowserWindow({ ...pos, ...windowProps });
  mainWindow.setMenuBarVisibility(false);
  mainWindow.setIcon(`${__dirname}/icon.png`);

  await app.event("electronInit", { mainWindow });

  if (app.settings.client.domain)
    mainWindow.loadURL(
      `http${app.settings.client.secure ? "s" : ""}://${
        app.settings.client.domain
      }`
    );
  else mainWindow.loadFile(`${__dirname}/index.html`);

  const callbacks = {};

  const send = (data, callback) =>
    new Promise((resolve) => {
      data.callbackServer = app.uuid();
      callbacks[data.callbackServer] = resolve;

      callback();
    });

  const back = (data) => {
    if (!callbacks[data.callbackServer]) return;

    try {
      callbacks[data.callbackServer](data);
    } catch (e) {
      console.log("err", callbacks[data.callbackServer], e);
    }

    delete callbacks[data.callbackServer];
  };

  app.on("electronEvent", (data) => {
    if (data.noCallback) mainWindow.webContents.send("msg", data);
    else return send(data, () => mainWindow.webContents.send("msg", data));
  });

  ipcMain.on("msg", async (event, data) => {
    if (data.callbackServer) back(data);
    else {
      data = await app.event("electronData", data);
      if (data.callbackClient) mainWindow.webContents.send("msg", data);
    }
  });

  let timer = false;
  const savePos = () => {
    fs.writeFile(`${__dirname}/data/pos.json`, JSON.stringify(pos), () => {});
    timer = false;
  };
  const setDebounce = () => {
    pos = mainWindow.getBounds();
    if (!timer) timer = setTimeout(savePos, 200);
  };

  mainWindow.on("resize", setDebounce);
  mainWindow.on("move", setDebounce);

  mainWindow.webContents.on("new-window", (e, url) => {
    e.preventDefault();
    shell.openExternal(url);
  });
});

try {
  pos = JSON.parse(fs.readFileSync(`${__dirname}/data/pos.json`));
  // eslint-disable-next-line no-empty
} catch (e) {}

electron.on("ready", () =>
  app.event("electronReady", {
    pos,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: `${__dirname}/module/electron/electron/preload.js`,
    },
    frame: false,
  })
);

electron.on("window-all-closed", () => {
  electron.quit();
  setTimeout(() => {
    process.kill(process.pid, "SIGINT");
  }, 100);
});

console.log("Started");
