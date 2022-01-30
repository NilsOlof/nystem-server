const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(
    hex
  );
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        alpha: parseInt(result[4] || 0, 16),
      }
    : null;
};

module.exports = (app) => {
  if (!app.settings.client.domain) return;

  const sharp = require("sharp");
  const icongen = require("./ico");
  let icoBuffer = "";
  const sizes = [16, 24, 32, 48, 64, 128, 192];
  const buffers = {};
  let original = false;

  const bgColor = hexToRgb(app.settings.bgColor || "#FFFFFF00");

  app.on("generateIconSize", async ({ width, height }) => {
    if (!original) return;

    const id = width + (height ? `x${height}` : "");

    let density = (width / original.width) * 72;
    density = density < 1 ? 1 : density;

    buffers[id] = await sharp(original.buffer, { density })
      .resize(width, height || width, { fit: "contain", background: bgColor })
      .toBuffer();

    return { buffer: buffers[id] };
  });

  app.on("favicon", async ({ file }) => {
    const fullPath = typeof file === "string" ? app.__dirname + file : file;
    if (!(await app.fs.exists(fullPath))) return;

    const buffer = await app.fs.readFile(fullPath);
    const { width, height } = await sharp(buffer).metadata();
    original = { file, buffer, width, height };

    const bufs = await Promise.all(
      sizes.map((width) => app.event("generateIconSize", { width }))
    );
    console.log("byyygd");
    icoBuffer = icongen(bufs.map(({ buffer }) => buffer));
    original.icoBuffer = icoBuffer;

    console.log("byyygdfino");
    return original;
  });

  if (app.settings.favicon)
    app.event("favicon", { file: app.settings.favicon });

  app.express.get("/favicon.ico", (req, res) => {
    const type = require("mime").getType(".ico");
    if (app.isCached(type, req, res)) return;

    res.setHeader("Content-Type", type);
    res.end(icoBuffer);
  });

  const toInt = (val) => parseInt(val, 10);

  app.express.get("/icon/*", async (req, res) => {
    const [width, height, ext] = req.params[0].split(/[x.]/);
    const type = require("mime").getType(".png");
    if (app.isCached(type, req, res)) return;

    const id = width + (ext ? `x${height}` : "");
    if (!buffers[id])
      await app.event("generateIconSize", {
        width: toInt(width),
        height: ext && toInt(height),
      });

    res.setHeader("Content-Type", type);
    res.end(buffers[id] || "");
  });
};
