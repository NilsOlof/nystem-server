module.exports = (app) => {
  if ("serviceWorker" in navigator)
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/nystem-service-worker.js").then(
        (registration) => {
          registration.update();
        },
        (err) => {
          console.log("ServiceWorker registration failed: ", err);
        }
      );
    });

  let deferredPrompt = false;

  window.addEventListener("beforeinstallprompt", (e) => {
    deferredPrompt = e;
  });

  app.on("canRunAppInstall", () => ({
    installable: !!deferredPrompt,
  }));

  app.on("runAppInstall", () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted")
        console.log("User accepted the install prompt");
      else console.log("User dismissed the install prompt");
    });
  });

  const regExpVersion = /main\.([0-9a-f]+)\.js/im;
  app.on("getAppVersion", () => ({
    appVersion: (regExpVersion.exec(
      [...document.head.children, ...document.body.children]
        .map((child) => child.src)
        .find((src) => regExpVersion.test(src))
    ) || [])[1],
  }));

  app.on("clearCacheAndReload", async () => {
    await app.storage.clear();
    window.caches.delete("nystem").then(() => {
      window.location.reload();
    });
  });
  app.on("init", -100, () => {
    app.connection.on("connection", ({ connected }) => {
      if (!connected) return;

      app.connection
        .emit({ type: "getAppVersion" })
        .then(async ({ appVersion }) => {
          const { appVersion: clientAppVersion } = await app.event(
            "getAppVersion"
          );
          app.settings.version = `${clientAppVersion}/${appVersion}`;

          if (
            !clientAppVersion ||
            !appVersion ||
            clientAppVersion === appVersion
          ) {
            await app.storage.setItem("havereloaded", "false");
            return;
          }

          if ((await app.storage.getItem("havereloaded")) === "true") return;

          await app.storage.setItem("havereloaded", "true");

          window.caches.delete("nystem").then(() => {
            window.location.reload();
          });
        });
    });
  });
  setTimeout(async () => {
    await app.storage.setItem("havereloaded", "false");
  }, 10000);
};
