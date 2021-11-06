const {
  app: electron,
  BrowserWindow,
  ipcMain,
  screen,
  shell,
} = require("electron");
const fs = require("fs");

let app = {};

if (fs.existsSync(`${__dirname}/core/core/index.js`))
  app = require(`${__dirname}/core/core`)();
else {
  app.addeventhandler = require(`${__dirname}/core/core/client/eventhandler`);
  app.addeventhandler(app);
  require("./scripts")(app);
}

if (require("electron-squirrel-startup")) app.quit();

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

  if (app.settings.client.port)
    mainWindow.loadURL(
      `http${app.settings.client.secure ? "s" : ""}://${
        app.settings.client.domain
      }`
    );
  else mainWindow.loadFile(`${__dirname}/index.html`);

  ipcMain.on("msg", (event, data) => {
    app.event("electronData", data);
  });

  app.on("electronEvent", (data) => {
    mainWindow.webContents.send("msg", data);
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
  })
);

electron.on("window-all-closed", () => {
  electron.quit();
  setTimeout(() => {
    process.kill(process.pid, "SIGINT");
  }, 100);
});

console.log("Started");
