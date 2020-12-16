self.addEventListener("install", async () => {
  console.log("SW installing");

  caches.delete("nystem").then(() => {
    console.log("Cache cleared");
  });
  self.skipWaiting();
});

self.addEventListener("activate", () => {
  console.log("SW activated");
});

self.addEventListener("fetch", (event) => {
  // eslint-disable-next-line prefer-const
  let { pathname, hostname } = new URL(event.request.url);

  const { host } = event.target.location;
  if (event.request.method !== "GET" || host.endsWith(".localhost")) return;

  if (host === hostname && !/\/[^/]+\.[a-z]+$/im.test(pathname.toString()))
    pathname = "/index.html";

  event.respondWith(
    (async () => {
      const cache = await caches.open("nystem");

      const cached = await cache.match(pathname);
      if (cached) return cached;

      const response = await fetch(event.request);

      cache.put(pathname, response.clone());
      return response;
    })()
  );
});
