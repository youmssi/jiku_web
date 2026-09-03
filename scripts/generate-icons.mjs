// Regenerates the PWA/favicon raster set from the canonical full-colour logo.
// Run: node scripts/generate-icons.mjs
//
// The source of truth is public/jiku-logo-1024.png (RGBA, 1024x1024). The mark
// inside it is offset (not centred), so this script first crops the image to
// its opaque bounding box, then area-averages it down to each target size and
// writes the icons the manifest and the root layout reference, plus a
// cropped/centred mark used by the JikūLogo component. No runtime dependency:
// PNG decoding/encoding is done here with zlib and a small CRC32.
import { deflateSync, inflateSync } from "node:zlib";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(root, "public", "jiku-logo-1024.png");
const OUT = join(root, "public");

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function decodePng(buf) {
  if (buf.slice(0, 8).toString("hex") !== "89504e470d0a1a0a") throw new Error("Not a PNG");
  let off = 8;
  let width = 0;
  let height = 0;
  let colorType = 6;
  const idat = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString("ascii", off + 4, off + 8);
    const data = buf.slice(off + 8, off + 8 + len);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      colorType = data.readUInt8(9);
    } else if (type === "IDAT") {
      idat.push(data);
    }
    off += 12 + len;
  }
  if (colorType !== 6) throw new Error(`Expected RGBA (6), got ${colorType}`);
  const raw = inflateSync(Buffer.concat(idat));
  const bpp = 4;
  const stride = width * bpp;
  const px = Buffer.alloc(width * height * bpp);
  for (let y = 0; y < height; y++) {
    const rowStart = y * (stride + 1);
    const filter = raw[rowStart];
    const row = raw.slice(rowStart + 1, rowStart + 1 + stride);
    for (let x = 0; x < stride; x++) {
      const left = x >= bpp ? px[y * stride + x - bpp] : 0;
      const up = y > 0 ? px[(y - 1) * stride + x] : 0;
      const upLeft = y > 0 && x >= bpp ? px[(y - 1) * stride + x - bpp] : 0;
      let val = row[x];
      if (filter === 1) val = (val + left) & 0xff;
      else if (filter === 2) val = (val + up) & 0xff;
      else if (filter === 3) val = (val + ((left + up) >> 1)) & 0xff;
      else if (filter === 4) {
        const p = left + up - upLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upLeft);
        const pr = pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
        val = (val + pr) & 0xff;
      }
      px[y * stride + x] = val;
    }
  }
  return { width, height, px };
}

function bbox(src, alphaThreshold) {
  const { width, height, px } = src;
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (px[(y * width + x) * 4 + 3] > alphaThreshold) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return { minX, minY, maxX, maxY };
}

function crop(src, box) {
  const w = box.maxX - box.minX + 1;
  const h = box.maxY - box.minY + 1;
  const bpp = 4;
  const out = Buffer.alloc(w * h * bpp);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const s = ((y + box.minY) * src.width + x + box.minX) * bpp;
      const d = (y * w + x) * bpp;
      out[d] = src.px[s];
      out[d + 1] = src.px[s + 1];
      out[d + 2] = src.px[s + 2];
      out[d + 3] = src.px[s + 3];
    }
  }
  return { width: w, height: h, px: out };
}

function resizeArea(src, targetW, targetH) {
  const { width: sw, height: sh, px } = src;
  const bpp = 4;
  const out = Buffer.alloc(targetW * targetH * bpp);
  const xScale = sw / targetW;
  const yScale = sh / targetH;
  for (let y = 0; y < targetH; y++) {
    const y0 = y * yScale;
    const y1 = Math.min(sh, (y + 1) * yScale);
    for (let x = 0; x < targetW; x++) {
      const x0 = x * xScale;
      const x1 = Math.min(sw, (x + 1) * xScale);
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let sy = Math.floor(y0); sy < Math.ceil(y1); sy++) {
        const weightY = Math.min(y1, sy + 1) - Math.max(y0, sy);
        for (let sx = Math.floor(x0); sx < Math.ceil(x1); sx++) {
          const weightX = Math.min(x1, sx + 1) - Math.max(x0, sx);
          const w = weightX * weightY;
          const p = (sy * sw + sx) * bpp;
          r += px[p] * w;
          g += px[p + 1] * w;
          b += px[p + 2] * w;
          a += px[p + 3] * w;
        }
      }
      const area = (x1 - x0) * (y1 - y0);
      const o = (y * targetW + x) * bpp;
      out[o] = Math.round(r / area);
      out[o + 1] = Math.round(g / area);
      out[o + 2] = Math.round(b / area);
      out[o + 3] = Math.round(a / area);
    }
  }
  return { width: targetW, height: targetH, px: out };
}

function compositeOnBackground(src, size, contentSize, background) {
  const scaled = resizeArea(src, contentSize, contentSize);
  const bpp = 4;
  const out = Buffer.alloc(size * size * bpp);
  for (let i = 0; i < size * size; i++) {
    out[i * bpp] = background[0];
    out[i * bpp + 1] = background[1];
    out[i * bpp + 2] = background[2];
    out[i * bpp + 3] = 255;
  }
  const offset = Math.floor((size - contentSize) / 2);
  for (let y = 0; y < contentSize; y++) {
    for (let x = 0; x < contentSize; x++) {
      const s = (y * contentSize + x) * bpp;
      const a = scaled.px[s + 3] / 255;
      const d = ((y + offset) * size + x + offset) * bpp;
      for (let c = 0; c < 3; c++) {
        out[d + c] = Math.round(scaled.px[s + c] * a + background[c] * (1 - a));
      }
      out[d + 3] = 255;
    }
  }
  return { width: size, height: size, px: out };
}

function encodePng({ width, height, px }) {
  const bpp = 4;
  const stride = width * bpp;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    px.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from("89504e470d0a1a0a", "hex"),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const src = decodePng(readFileSync(SRC));

// Crop to the mark and re-centre it (the source is offset within its canvas).
const box = bbox(src, 40);
const margin = Math.round((Math.min(box.maxX - box.minX, box.maxY - box.minY) + 1) * 0.02);
const cropped = crop(src, {
  minX: Math.max(0, box.minX - margin),
  minY: Math.max(0, box.minY - margin),
  maxX: Math.min(src.width - 1, box.maxX + margin),
  maxY: Math.min(src.height - 1, box.maxY + margin),
});

// Mark asset for the JikūLogo component (square, transparent, centred).
const mark = resizeArea(cropped, 512, 512);
writeFileSync(join(OUT, "jiku-logo-mark.png"), encodePng(mark));
console.log("wrote jiku-logo-mark.png (512x512, cropped/centred)");

const targets = [
  { file: "icon-192.png", size: 192 },
  { file: "icon-512.png", size: 512 },
  { file: "apple-icon-180.png", size: 180 },
];

for (const t of targets) {
  const resized = resizeArea(cropped, t.size, t.size);
  writeFileSync(join(OUT, t.file), encodePng(resized));
  console.log(`wrote ${t.file} (${t.size}x${t.size})`);
}

const maskableSize = 512;
const contentSize = Math.round(maskableSize * 0.66);
const maskable = compositeOnBackground(cropped, maskableSize, contentSize, [255, 255, 255]);
writeFileSync(join(OUT, "icon-maskable-512.png"), encodePng(maskable));
console.log(`wrote icon-maskable-512.png (${maskableSize}x${maskableSize}, white bg)`);
