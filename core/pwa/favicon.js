const sharp = require("sharp");

module.exports = (app) => {
  const icongen = require("./ico");
  let icoBuffer = "";
  const sizes = [16, 24, 32, 48, 64, 128, 192, 256, 512, 1024];
  let buffers = [];

  app.on("favicon", ({ path, fileData }) => {
    const generate = async () => {
      const buffer = await sharp(
        fileData || app.fs.readFileSync(app.__dirname + path)
      ).png();

      buffers = await Promise.all(
        sizes.map(async (size) =>
          buffer
            .resize(size, size, {
              fit: "contain",
              background: { r: 255, g: 255, b: 255, alpha: 0 },
            })
            .toBuffer()
        )
      );

      icoBuffer = icongen(buffers.slice(0, 6));
    };
    generate();
  });

  app.express.get("/favicon.ico", (req, res) => {
    const type = require("mime").getType(".ico");
    if (app.isCached(type, req, res)) return;

    res.setHeader("Content-Type", type);
    res.end(icoBuffer);
  });

  const waitEventOrTimeout = (event) =>
    new Promise((resolve) => {
      const doEv = (res) => {
        app.off(event, doEv);
        resolve(res === true);
        clearTimeout(timer);
      };

      const timer = setTimeout(() => doEv(true), 10000);
      app.on(event, doEv);
    });

  app.express.get("/icon/*", async (req, res) => {
    const [size] = req.params[0].split(".");
    const type = require("mime").getType(".png");
    if (app.isCached(type, req, res)) return;

    if (!buffers.length && (await waitEventOrTimeout("favicon"))) {
      res.end("");
      return;
    }

    res.setHeader("Content-Type", type);
    res.end(buffers[sizes.indexOf(parseInt(size, 10))]);
  });
};
