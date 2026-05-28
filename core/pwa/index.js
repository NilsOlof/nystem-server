export default async (app) => {
  await app.require("./favicon");
  await app.require("./serviceworker");

  app.file.on("get", async ({ id, url, type }) => {
    if (url !== "/reset") return;

    app.file.event("response", {
      id,
      headers: {
        "Cache-Control": `max-age=0, must-revalidate`,
        "Content-Type": type,
      },
      data: await app.fs.readFile(
        `${app.__dirname}/core/pwa/reset.html`,
        "utf8",
      ),
      closed: true,
    });

    return {};
  });
};
