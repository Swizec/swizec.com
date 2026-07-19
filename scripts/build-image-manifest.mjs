// Precomputes image metadata (intrinsic dimensions + LQIP placeholder) for
// every raster under pages/ into lib/image-manifest.json, which is committed.
// The MDX pipeline reads the manifest synchronously at compile time — no sharp
// work inside the Vite build, which OOM'd Vercel's builder when 3k+ decodes
// ran alongside chunk rendering.
//
// Run `pnpm images` after adding or changing images in pages/. Images missing
// from the manifest still render (the build warns and computes just those on
// the fly).
import { readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { listReferencedWpContent, wpContentDiskPath } from '../lib/wp-content.mjs';

const RASTER_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif']);
const LQIP_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif']);
const OUT = 'lib/image-manifest.json';

function* rasters(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* rasters(full);
    else if (RASTER_EXTS.has(path.extname(entry.name).toLowerCase())) yield full;
  }
}

const t0 = performance.now();
const manifest = {};
let failed = 0;

// pages/ rasters + the legacy wp-content images articles actually reference
// (static/wp-content holds 1.3GB, mostly unreferenced — only referenced files
// are indexed, deployed, and rendered through ContentImage)
const files = [...rasters('pages')];
for (const urlPath of listReferencedWpContent('pages')) {
  if (!RASTER_EXTS.has(path.extname(urlPath).toLowerCase())) continue;
  const disk = wpContentDiskPath(urlPath);
  if (disk) files.push(path.relative(process.cwd(), disk));
}
await Promise.all(
  files.map(async (file) => {
    const ext = path.extname(file).toLowerCase();
    try {
      const image = sharp(file);
      const meta = await image.metadata();
      if (!meta.width || !meta.height) return;
      // EXIF-rotated photos report pre-rotation dimensions
      const rotated = (meta.orientation ?? 1) >= 5;
      const entry = {
        w: rotated ? meta.height : meta.width,
        h: rotated ? meta.width : meta.height,
      };
      // Transparent images skip the LQIP — it would shine through the alpha
      // regions after the real image loads. GIFs keep dimensions only.
      if (LQIP_EXTS.has(ext) && !meta.hasAlpha) {
        const buf = await image.rotate().resize(20).webp({ quality: 20 }).toBuffer();
        entry.lqip = `data:image/webp;base64,${buf.toString('base64')}`;
      }
      // NFC so keys match markdown-URL-derived lookups on macOS (NFD on disk)
      manifest[file.split(path.sep).join('/').normalize('NFC')] = entry;
    } catch {
      failed++;
    }
  }),
);

// Sorted keys, one entry per line — stable, reviewable diffs.
const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(OUT, JSON.stringify(sorted, null, 1));

console.log(
  `${Object.keys(sorted).length} images → ${OUT} in ${((performance.now() - t0) / 1000).toFixed(1)}s` +
    (failed ? ` (${failed} unreadable, skipped)` : ''),
);
