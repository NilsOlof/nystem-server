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
  let buffers = {};
  const bgColor = hexToRgb(app.settings.bgColor || "#FFFFFF00");

  const generateSize = async (width, height) => {
    const id = width + (height ? `x${height}` : "");

    buffers[id] = await buffers.original
      .resize(width, height || width, { fit: "contain", background: bgColor })
      .toBuffer();

    return buffers[id];
  };

  const generate = async (file) => {
    const fullPath = typeof file === "string" ? app.__dirname + file : file;
    if (!app.fs.existsSync(fullPath)) return;

    buffers = {};
    buffers.original = await sharp(fullPath).png();

    icoBuffer = icongen(
      await Promise.all(sizes.map((size) => generateSize(size)))
    );
    return { file, png: await buffers.original.toBuffer() };
  };
  app.on("favicon", ({ file }) => generate(file));
  if (app.settings.favicon) generate(app.settings.favicon);

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
    if (!buffers[id]) await generateSize(toInt(width), ext && toInt(height));

    res.setHeader("Content-Type", type);
    res.end(buffers[id] || "");
  });
};
