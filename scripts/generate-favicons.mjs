// One-time generator for the favicon set, committed to the repo. Run again
// only if static/favicon.png (the 16×16 pixel-art source) changes:
//   node scripts/generate-favicons.mjs
//
// The source is pixel art, so everything upscales with nearest-neighbor —
// crisp chunky pixels instead of the blurry Lanczos blowups the Gatsby
// manifest plugin shipped. The apple-touch icon is flattened onto the site
// background because iOS composites transparent icons onto black.
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import sharp from 'sharp';

const SRC = 'static/favicon.png';
const OUT_DIR = 'app/assets/favicons';
const BACKGROUND = '#CCCFFA'; // --color-background-body (y2k theme, light)

mkdirSync(OUT_DIR, { recursive: true });

const px = (size, opts = {}) =>
    sharp(SRC)
        .resize(size, size, { kernel: 'nearest' })
        .flatten(opts.flatten ? { background: BACKGROUND } : false)
        .png({ compressionLevel: 9 })
        .toBuffer();

// Pack PNGs into an ICO container (PNG-in-ICO, supported everywhere modern).
function ico(pngs) {
    const header = Buffer.alloc(6);
    header.writeUInt16LE(1, 2); // type: icon
    header.writeUInt16LE(pngs.length, 4);
    const entries = [];
    const blobs = [];
    let offset = 6 + 16 * pngs.length;
    for (const { size, data } of pngs) {
        const entry = Buffer.alloc(16);
        entry.writeUInt8(size >= 256 ? 0 : size, 0); // width
        entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
        entry.writeUInt16LE(1, 4); // color planes
        entry.writeUInt16LE(32, 6); // bits per pixel
        entry.writeUInt32LE(data.length, 8);
        entry.writeUInt32LE(offset, 12);
        entries.push(entry);
        blobs.push(data);
        offset += data.length;
    }
    return Buffer.concat([header, ...entries, ...blobs]);
}

writeFileSync(`${OUT_DIR}/favicon-32.png`, await px(32));
writeFileSync(`${OUT_DIR}/apple-touch-icon.png`, await px(180, { flatten: true }));
writeFileSync(`${OUT_DIR}/icon-192.png`, await px(192));
writeFileSync(`${OUT_DIR}/icon-512.png`, await px(512));
writeFileSync(
    'app/favicon.ico',
    ico([
        { size: 16, data: readFileSync(SRC) },
        { size: 32, data: await px(32) },
        { size: 48, data: await px(48) },
    ]),
);

console.log(`favicons → ${OUT_DIR}/ + app/favicon.ico`);
