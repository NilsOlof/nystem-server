const start = async () => {
  window.localStorage.clear();
  await new Promise((resolve, reject) => {
    const request = window.indexedDB.deleteDatabase("nystem");
    request.onsuccess = resolve;
    request.onerror = () => reject(request.error);
  });

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
