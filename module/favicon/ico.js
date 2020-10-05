const { PNG } = require("pngjs");

const FILE_HEADER_SIZE = 6;
const ICO_DIRECTORY_SIZE = 16;
const BITMAPINFOHEADER_SIZE = 40;
const BI_RGB = 0;
const BPP_ALPHA = 4;

const convertPNGtoDIB = (src, width, height, bpp) => {
  const cols = width * bpp;
  const rows = height * cols;
  const rowEnd = rows - cols;
  const dest = Buffer.alloc(src.length);

  for (let row = 0; row < rows; row += cols) {
    for (let col = 0; col < cols; col += bpp) {
      // RGBA: Top/Left -> Bottom/Right
      let pos = row + col;
      const r = src.readUInt8(pos);
      const g = src.readUInt8(pos + 1);
      const b = src.readUInt8(pos + 2);
      const a = src.readUInt8(pos + 3);

      // BGRA: Right/Left -> Top/Right
      pos = rowEnd - row + col;
      dest.writeUInt8(b, pos);
      dest.writeUInt8(g, pos + 1);
      dest.writeUInt8(r, pos + 2);
      dest.writeUInt8(a, pos + 3);
    }
  }

  return dest;
};

const createBitmapInfoHeader = (png, compression) => {
  const b = Buffer.alloc(BITMAPINFOHEADER_SIZE);
  b.writeUInt32LE(BITMAPINFOHEADER_SIZE, 0); // 4 DWORD biSize
  b.writeInt32LE(png.width, 4); // 4 LONG  biWidth
  b.writeInt32LE(png.height * 2, 8); // 4 LONG  biHeight
  b.writeUInt16LE(1, 12); // 2 WORD  biPlanes
  b.writeUInt16LE(BPP_ALPHA * 8, 14); // 2 WORD  biBitCount
  b.writeUInt32LE(compression, 16); // 4 DWORD biCompression
  b.writeUInt32LE(png.data.length, 20); // 4 DWORD biSizeImage
  b.writeInt32LE(0, 24); // 4 LONG  biXPelsPerMeter
  b.writeInt32LE(0, 28); // 4 LONG  biYPelsPerMeter
  b.writeUInt32LE(0, 32); // 4 DWORD biClrUsed
  b.writeUInt32LE(0, 36); // 4 DWORD biClrImportant

  return b;
};

const createDirectory = (png, offset) => {
  const b = Buffer.alloc(ICO_DIRECTORY_SIZE);
  const size = png.data.length + BITMAPINFOHEADER_SIZE;
  const width = png.width >= 256 ? 0 : png.width;
  const height = png.height >= 256 ? 0 : png.height;
  const bpp = BPP_ALPHA * 8;

  b.writeUInt8(width, 0); // 1 BYTE  Image width
  b.writeUInt8(height, 1); // 1 BYTE  Image height
  b.writeUInt8(0, 2); // 1 BYTE  Colors
  b.writeUInt8(0, 3); // 1 BYTE  Reserved
  b.writeUInt16LE(1, 4); // 2 WORD  Color planes
  b.writeUInt16LE(bpp, 6); // 2 WORD  Bit per pixel
  b.writeUInt32LE(size, 8); // 4 DWORD Bitmap (DIB) size
  b.writeUInt32LE(offset, 12); // 4 DWORD Offset

  return b;
};

const createFileHeader = (count) => {
  const b = Buffer.alloc(FILE_HEADER_SIZE);
  b.writeUInt16LE(0, 0); // 2 WORD Reserved
  b.writeUInt16LE(1, 2); // 2 WORD Type
  b.writeUInt16LE(count, 4); // 2 WORD Image count

  return b;
};

const writeDirectories = (pngs) => {
  let offset = FILE_HEADER_SIZE + ICO_DIRECTORY_SIZE * pngs.length;

  return Buffer.concat(
    pngs.map((png) => {
      const result = createDirectory(png, offset);
      offset += png.data.length + BITMAPINFOHEADER_SIZE;
      return result;
    })
  );
};

const writePNGs = (pngs) =>
  Buffer.concat(
    pngs.map((png) => {
      const header = createBitmapInfoHeader(png, BI_RGB);

      const dib = convertPNGtoDIB(png.data, png.width, png.height, BPP_ALPHA);
      return Buffer.concat([header, dib]);
    })
  );

const generateICO = (pngBuffers) => {
  const pngs = pngBuffers.map((data) => PNG.sync.read(data));

  return Buffer.concat([
    createFileHeader(pngs.length),
    writeDirectories(pngs),
    writePNGs(pngs),
  ]);
};

module.exports = generateICO;
