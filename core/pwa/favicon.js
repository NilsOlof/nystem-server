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
  const buffersWebp = {};
  let original = false;

  const bgColor = hexToRgb(app.settings.bgColor || "#FFFFFF00");

  app.on("generateIconSize", async ({ width, height }) => {
    if (!original) return;

    const id = width + (height ? `x${height}` : "");

    let density = (width / original.width) * 72;
    density = density < 1 ? 1 : density;

    const image = await sharp(original.buffer, { density }).resize(
      width,
      height || width,
      { fit: "contain", background: bgColor }
    );
    buffers[id] = await image.toBuffer();
    buffersWebp[id] = await image.webp().toBuffer();

    return { buffer: buffers[id] };
  });

  app.on("favicon", async ({ file }) => {
    const fullPath = typeof file === "string" ? app.__dirname + file : file;
    if (!(await app.fs.exists(fullPath))) return;

    const buffer = await app.fs.readFile(fullPath);
    const { width, height } = await sharp(buffer).metadata();
    original = { file, buffer, width, height };

    const bufs = [];
    for await (const width of sizes)
      bufs.push(await app.event("generateIconSize", { width }));

    icoBuffer = icongen(bufs.map(({ buffer }) => buffer));
    original.icoBuffer = icoBuffer;

    return original;
  });

  if (app.settings.favicon)
    app.on("start", -100, () => {
      app.event("favicon", { file: app.settings.favicon });
    });

  app.file.on("get", ({ id, url, type }) => {
    if (url !== "/favicon.ico") return;

    app.file.event("response", {
      id,
      data: icoBuffer,
      closed: true,
      headers: { "content-type": type },
    });
    return {};
  });

  const toInt = (val) => parseInt(val, 10);

  app.file.on("get", async ({ id, url, type, headers }) => {
    if (!url?.startsWith("/icon/")) return;
    const [, , width, height, ext] = url.split(/[/x.]/);

    let data;
    const name = width + (ext ? `x${height}` : "");

    if (!buffers[name])
      await app.event("generateIconSize", {
        width: toInt(width),
        height: ext && toInt(height),
      });

    if (headers.accept?.includes("image/webp")) {
      type = "image/webp";
      data = buffersWebp[name];
    } else data = buffers[name];

    app.file.event("response", {
      id,
      data,
      closed: true,
      headers: { "content-type": type },
    });
    return {};
  });
};
