module.exports = (app) => {
  if ("serviceWorker" in navigator)
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/nystem-service-worker.js").then(
        (registration) => {
          console.log("ServiceWorker registration successful");
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

  const regExpVersion = /main\.([0-9a-f]+)\.chunk.js/im;
  app.on("getAppVersion", () => ({
    appVersion: (regExpVersion.exec(
      [...document.body.children]
        .map((child) => child.src)
        .find((src) => regExpVersion.test(src))
    ) || [])[1],
  }));

  app.on("clearCacheAndReload", () => {
    window.localStorage.clear();
    window.caches.delete("nystem").then(() => {
      window.location.reload();
    });
  });

  app.connection.on("connect", () => {
    app.connection
      .emit({ type: "getAppVersion" })
      .then(async ({ appVersion }) => {
        const { appVersion: clientAppVersion } = await app.event(
          "getAppVersion"
        );
        console.log("At version", { clientAppVersion, appVersion });
        if (
          !clientAppVersion ||
          !appVersion ||
          clientAppVersion === appVersion
        ) {
          window.localStorage.setItem("havereloaded", "false");
          return;
        }

        if (window.localStorage.getItem("havereloaded") === "true") return;

        window.localStorage.setItem("havereloaded", "true");

        window.caches.delete("nystem").then(() => {
          window.location.reload();
        });
      });
  });
  setTimeout(() => {
    window.localStorage.setItem("havereloaded", "false");
  }, 10000);
};
