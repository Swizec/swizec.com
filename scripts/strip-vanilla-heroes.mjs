// One-time migration: remove `hero:` frontmatter that points at the old
// vanilla images, so those pages fall back to the generated OG card.
//
//   - defaultHero.jpg           — the site-wide placeholder hero
//   - screenshot-<timestamp>.*  — Gatsby-era auto-generated social cards,
//                                 superseded by the takumi card
//
// Image files stay on disk; only the frontmatter reference is removed. The
// build's hero-copy step only ships referenced heroes, so unreferenced ones
// stop being deployed automatically.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const HERO_LINE =
  /^hero:\s*["']?(?:[^"'\n]*defaultHero[^"'\n]*|[^"'\n]*screenshot-\d+\.[a-z]+)["']?\s*$/;

function* mdxFiles(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* mdxFiles(full);
    else if (/\.mdx?$/.test(entry.name)) yield full;
  }
}

let defaultHero = 0;
let screenshot = 0;
let scanned = 0;

for (const file of mdxFiles('pages')) {
  scanned++;
  const content = readFileSync(file, 'utf8');
  // a handful of old files are CRLF — accept both line endings
  const open = content.match(/^---\r?\n/);
  if (!open) continue;
  const end = content.indexOf('\n---', open[0].length - 1);
  if (end === -1) continue;

  const frontmatter = content.slice(open[0].length, end);
  const lines = frontmatter.split('\n');
  const kept = lines.filter((line) => {
    if (!HERO_LINE.test(line)) return true;
    if (line.includes('defaultHero')) defaultHero++;
    else screenshot++;
    return false;
  });
  if (kept.length === lines.length) continue;

  writeFileSync(file, `${open[0]}${kept.join('\n')}${content.slice(end)}`);
}

console.log(
  `scanned ${scanned} files: stripped ${defaultHero} defaultHero + ${screenshot} screenshot heroes`,
);
