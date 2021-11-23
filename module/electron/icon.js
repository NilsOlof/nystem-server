const Icns = require("@fiahfy/icns");
const os = require("os");

const sizes = [
  { osType: "icp4", size: 16 },
  { osType: "icp5", size: 32 },
  { osType: "icp6", size: 64 },
  { osType: "ic07", size: 128 },
  { osType: "ic08", size: 256 },
  { osType: "ic09", size: 512 },
  { osType: "ic10", size: 1024 },
  { osType: "ic11", size: 32 },
  { osType: "ic12", size: 64 },
  { osType: "ic13", size: 256 },
  { osType: "ic14", size: 512 },
];

module.exports = (app) => {
  app.on("favicon", -10, async ({ buffer }) => {
    await app.fs.writeFile(`${app.__dirname}/electron/src/icon.png`, buffer);

    if (os.platform() !== "darwin") return;

    const icns = new Icns();

    await Promise.all(
      sizes.map(async ({ osType, size: width }) => {
        const { buffer } = await app.event("generateIconSize", { width });

        await icns.appendImage(buffer, osType);
      })
    );

    await app.fs.writeFile(
      `${app.__dirname}/electron/src/icon.icns`,
      icns.data
    );
  });
};

/*
{ osType: 'is32', size: 16, format: 'RGB' },
{ osType: 'il32', size: 32, format: 'RGB' },
{ osType: 'ih32', size: 48, format: 'RGB' },
{ osType: 'it32', size: 128, format: 'RGB' },
{ osType: 's8mk', size: 16, format: 'MASK' },
{ osType: 'l8mk', size: 32, format: 'MASK' },
{ osType: 'h8mk', size: 48, format: 'MASK' },
{ osType: 't8mk', size: 128, format: 'MASK' },
{ osType: 'ic04', size: 16, format: 'ARGB' },
{ osType: 'ic05', size: 32, format: 'ARGB' },
{ osType: 'icp4', size: 16, format: 'PNG' },
{ osType: 'icp5', size: 32, format: 'PNG' },
{ osType: 'icp6', size: 64, format: 'PNG' },
{ osType: 'ic07', size: 128, format: 'PNG' },
{ osType: 'ic08', size: 256, format: 'PNG' },
{ osType: 'ic09', size: 512, format: 'PNG' },
{ osType: 'ic10', size: 1024, format: 'PNG' },
{ osType: 'ic11', size: 32, format: 'PNG' },
{ osType: 'ic12', size: 64, format: 'PNG' },
{ osType: 'ic13', size: 256, format: 'PNG' },
{ osType: 'ic14', size: 512, format: 'PNG' },
*/
