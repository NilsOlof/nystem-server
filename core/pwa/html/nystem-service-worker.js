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
      try {
        const cache = await caches.open("nystem");

        const cached = await cache.match(pathname);
        if (cached) return cached;

        const response = await fetch(event.request);
        if (
          response.headers.get("Cache-Control") !== "max-age=0, must-revalidate"
        )
          cache.put(pathname, response.clone());

        return response;
      } catch (e) {
        console.log("Fetch failed", e, pathname);
        return "Page not found";
      }
    })()
  );
});
