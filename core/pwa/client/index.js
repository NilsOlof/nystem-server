module.exports = (app) => {
  const install = () => {
    navigator.serviceWorker.register("/nystem-service-worker.js").then(
      (registration) => {
        registration.update();
      },
      (err) => {
        console.log("ServiceWorker registration failed: ", err);
      }
    );
  };

  if ("serviceWorker" in navigator)
    window.addEventListener("load", () => {
      if (app.settings.noLoggedOutStorage)
        setTimeout(() => {
          if (app.session.user) install();
        }, 200);
      else install();
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
    if (window.caches) await window.caches.delete("nystem");

    window.location.reload();
  });

  const checkUpdate = async () => {
    app.connection
      .emit({ type: "getAppVersion" })
      .then(async ({ appVersion }) => {
        const { appVersion: clientAppVersion, noReload } = await app.event(
          "getAppVersion"
        );
        app.settings.version = `${clientAppVersion}/${appVersion}`;

        if (
          !clientAppVersion ||
          !appVersion ||
          clientAppVersion === appVersion
        ) {
          await app.storage.removeItem({ id: "havereloaded" });
          return;
        }

        const { value } = await app.storage.getItem({ id: "havereloaded" });
        if (value === "true") return;

        await app.storage.setItem({ id: "havereloaded", value: "true" });
        if (window.caches) await window.caches.delete("nystem");

        if (!noReload) setTimeout(() => window.location.reload(), 200);
      });
  };

  app.on("init", -100, () => {
    if (app.connection.connected) checkUpdate();

    app.connection.on("connection", ({ connected }) => {
      if (!connected) return;
      checkUpdate();
    });
  });
  setTimeout(async () => {
    await app.storage.removeItem({ id: "havereloaded" });
  }, 10000);
};
