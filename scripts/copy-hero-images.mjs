// Deploys hero images into the static output. Heroes are frontmatter strings —
// nothing imports them, so Vite never bundles them and the serverless function
// has no access to them; this copy step is what makes /page-assets/<path> URLs
// (used as og:image) exist on the deployment, served straight from the CDN
// with no function in the loop.
import { copyFileSync, mkdirSync, statSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { allPages } from '../.content-collections/generated/index.js';
import { heroRelPath } from '../lib/hero-asset.mjs';

// Hero images (frontmatter, not imported by MDX so Vite never bundles them) are
// served as og:image at /page-assets/<path>. Copy each page's hero into the
// static output, downscaling big ones to OG size (≤1200px) so the deploy stays
// lean — full-res thumbnails would add ~400MB.
const heroDst = '.vercel/output/static/page-assets';
const MAX_EDGE = 1200;
const RESIZE_OVER = 150 * 1024; // leave already-small files untouched
let copied = 0;
let resized = 0;
let missing = 0;
let bytes = 0;
const seen = new Set();

await Promise.all(
  allPages.map(async (page) => {
    const rel = heroRelPath(page._meta.directory, page.hero);
    if (!rel || seen.has(rel)) return;
    seen.add(rel);
    const from = path.join('pages', rel);
    const to = path.join(heroDst, rel);
    let size;
    try {
      size = statSync(from).size;
    } catch {
      missing++;
      return;
    }
    const ext = path.extname(rel).toLowerCase();
    const raster = ext === '.jpg' || ext === '.jpeg' || ext === '.png' || ext === '.webp';
    mkdirSync(path.dirname(to), { recursive: true });
    try {
      if (size > RESIZE_OVER && raster) {
        let pipeline = sharp(from).resize(MAX_EDGE, MAX_EDGE, {
          fit: 'inside',
          withoutEnlargement: true,
        });
        // Re-encode with format-specific compression — the real size win.
        // PNG palette quantization shrinks screenshots dramatically; mozjpeg
        // squeezes photos. (gif/svg fall through to a plain copy.)
        if (ext === '.png') pipeline = pipeline.png({ compressionLevel: 9, palette: true });
        else if (ext === '.webp') pipeline = pipeline.webp({ quality: 80 });
        else pipeline = pipeline.jpeg({ quality: 80, mozjpeg: true });
        await pipeline.toFile(to);
        resized++;
      } else {
        copyFileSync(from, to);
        copied++;
      }
      bytes += statSync(to).size;
    } catch {
      // Corrupt/unsupported source — fall back to a plain copy so the URL still resolves
      try {
        copyFileSync(from, to);
        copied++;
        bytes += size;
      } catch {
        missing++;
      }
    }
  }),
);

console.log(
  `  hero images → ${heroDst}/ : ${resized} resized, ${copied} copied, ${missing} missing (${(bytes / 1e6).toFixed(1)} MB)`,
);
