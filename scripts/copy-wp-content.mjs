// Deploys the legacy wp-content images that articles actually reference.
// static/wp-content holds 1.3GB of WordPress-era uploads, mostly unreferenced
// — copying it wholesale would bloat every deploy. Referenced files (~1.1k,
// ~390MB) are copied as-is to their original /wp-content/... public paths, so
// old inbound links keep resolving; display sizes come from the image
// optimizer like every other content image.
import { copyFileSync, mkdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { listReferencedWpContent, wpContentDiskPath } from '../lib/wp-content.mjs';

const OUT = '.vercel/output/static';
let copied = 0;
let missing = 0;
let bytes = 0;

for (const urlPath of listReferencedWpContent('pages')) {
  const disk = wpContentDiskPath(urlPath);
  if (!disk) {
    missing++;
    continue;
  }
  // Preserve the on-disk name; the static server percent-decodes request
  // paths, so encoded references still resolve.
  const dest = path.join(OUT, path.relative(path.join(process.cwd(), 'static'), disk));
  mkdirSync(path.dirname(dest), { recursive: true });
  copyFileSync(disk, dest);
  copied++;
  bytes += statSync(disk).size;
}

console.log(
  `  wp-content → ${OUT}/wp-content : ${copied} copied (${(bytes / 1e6).toFixed(0)} MB)` +
    (missing ? `, ${missing} referenced files missing from static/` : ''),
);
