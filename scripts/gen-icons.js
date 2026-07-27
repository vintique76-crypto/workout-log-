const zlib = require("zlib");
const fs = require("fs");
const path = require("path");

const table = (() => {
  const t = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function makeIcon(size, filename) {
  const bg = [17, 17, 17];
  const fg = [255, 255, 255];
  const raw = Buffer.alloc(size * (size * 3 + 1));
  const cx = size / 2;
  const cy = size / 2;
  const barHalfLen = size * 0.26;
  const barThickness = size * 0.1;
  const endRadius = size * 0.15;
  const cornerRadius = size * 0.22;

  for (let y = 0; y < size; y++) {
    const rowStart = y * (size * 3 + 1);
    raw[rowStart] = 0;
    for (let x = 0; x < size; x++) {
      let inside = true;
      const dx = Math.min(x, size - 1 - x);
      const dy = Math.min(y, size - 1 - y);
      if (dx < cornerRadius && dy < cornerRadius) {
        const ddx = cornerRadius - dx;
        const ddy = cornerRadius - dy;
        if (ddx * ddx + ddy * ddy > cornerRadius * cornerRadius) inside = false;
      }
      let color = bg;
      if (inside) {
        const relX = x - cx;
        const relY = y - cy;
        const onBar = Math.abs(relY) <= barThickness / 2 && Math.abs(relX) <= barHalfLen;
        const distLeft = Math.hypot(relX + barHalfLen, relY);
        const distRight = Math.hypot(relX - barHalfLen, relY);
        const onEnd = distLeft <= endRadius || distRight <= endRadius;
        color = onBar || onEnd ? fg : bg;
      }
      const px = rowStart + 1 + x * 3;
      raw[px] = color[0];
      raw[px + 1] = color[1];
      raw[px + 2] = color[2];
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const idatData = zlib.deflateSync(raw);
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", idatData),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  fs.mkdirSync(path.dirname(filename), { recursive: true });
  fs.writeFileSync(filename, png);
}

const root = path.join(__dirname, "..");
makeIcon(512, path.join(root, "public/icon-512.png"));
makeIcon(192, path.join(root, "public/icon-192.png"));
makeIcon(192, path.join(root, "app/icon.png"));
makeIcon(180, path.join(root, "app/apple-icon.png"));
console.log("icons generated");
