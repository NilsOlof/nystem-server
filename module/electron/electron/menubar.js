module.exports = async (app) => {
  let window = false;

  app.on("electronInit", 100, async ({ mainWindow }) => {
    window = mainWindow;
    mainWindow.setMenuBarVisibility(false);
  });

  app.on("electronData", async ({ event, x, y }) => {
    if (event !== "setWindowPos") return;

    window.setPosition(x, y);
  });

  app.on("electronData", async ({ event, button, active }) => {
    if (event !== "appButton") return;

    if (button === "minus") window.minimize();
    if (button === "close") window.close();
    if (button === "rectangle") {
      if (active) window.unmaximize();
      else window.maximize();
    }
  });
};
