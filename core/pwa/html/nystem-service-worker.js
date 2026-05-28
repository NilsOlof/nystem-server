const init = () => {
  self.addEventListener("install", async () => {
    console.log("SW installing ");

    self.skipWaiting();

    caches.delete("nystem").then(() => {
      console.log("Cache cleared");
    });

    self.skipWaiting();
  });

  self.addEventListener("activate", () => {
    console.log("SW activated");
  });

  const selectRange = async (res, request) => {
    const range = request.headers.get("range");
    const pos = range && Number(/^bytes\=(\d+)\-$/g.exec(range)[1]);

    if (!pos) return res;
    const ab = await res.arrayBuffer();

    return new Response(ab.slice(pos), {
      status: 206,
      statusText: "Partial Content",
      headers: [
        ["Content-Type", "video/mpeg"],
        ["Content-Range", `bytes ${pos}-${ab.byteLength - 1}/${ab.byteLength}`],
        ["Content-Length", ab.byteLength],
      ],
    });
  };

  self.addEventListener("fetch", (event) => {
    const { request, target } = event;
    // eslint-disable-next-line prefer-const
    let { pathname, hostname } = new URL(request.url);

    const { host } = target.location;
    const path = pathname.toString();
    if (path === "/reset") caches.delete("nystem");

    if (
      request.method !== "GET" ||
      host.endsWith(".localhost") ||
      path.endsWith(".mp3") ||
      path.endsWith(".m4a") ||
      path.startsWith("/feed/") ||
      path.startsWith("/spotify") ||
      self.location.hostname !== hostname
    )
      return;

    if (host === hostname && !/\/[^/]+\.[a-z0-9]+$/im.test(pathname.toString()))
      pathname = "/index.html";
    else pathname = request.url;

    event.respondWith(
      (async () => {
        try {
          const cache = await caches.open("nystem");
          const cached = await cache.match(pathname);

          if (cached) return selectRange(cached, request);

          const response = await fetch(request);

          if (
            response.headers.get("Cache-Control") !==
              "max-age=0, must-revalidate" &&
            response.status !== 206 &&
            response.status < 300
          )
            cache.put(pathname, response.clone());

          return response;
        } catch (e) {
          console.log("Fetch failed", e, pathname);
          return "Page not found";
        }
      })(),
    );
  });
};
init();
