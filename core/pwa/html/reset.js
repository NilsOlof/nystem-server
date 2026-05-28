const start = async () => {
  window.localStorage.clear();

  if (window.caches) {
    const cache = await window.caches.open("nystem");

    if ((await cache.keys()).length) {
      await window.caches.delete("nystem");
      window.location.reload(true);
    }
  }
  window.location.replace("/");
};
start();
