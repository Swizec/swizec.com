// Legacy WordPress-era images: articles reference them at
// https://swizec.com/wp-content/... and the files live in static/wp-content
// (tracked, 1.3GB — mostly unreferenced). The MDX pipeline rewrites those
// references to root-relative /wp-content/... (same public path, so old
// inbound links keep working), and only the ~1.1k referenced files get
// deployed (scripts/copy-wp-content.mjs) and indexed (image manifest).
//
// Plain ESM shared by the remark plugin, the manifest script, the copy
// script, and the vite dev middleware.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const WP_URL = /^https?:\/\/(?:www\.)?swizec\.com(\/wp-content\/[^\s"'<>]+)$/i;

// /wp-content/... path for a swizec.com wp-content URL (query/fragment
// stripped — files don't have them), or null for anything else.
export function wpContentUrlPath(url) {
  if (!url) return null;
  if (url.startsWith('/wp-content/')) return url.split(/[?#]/)[0];
  const match = url.match(WP_URL);
  return match ? match[1].split(/[?#]/)[0] : null;
}

// Absolute disk path under static/ for a /wp-content/ url path, or null when
// the file doesn't exist. Tries the path as written first — some legacy
// filenames literally contain percent-escapes — then decoded.
export function wpContentDiskPath(urlPath, repoRoot = process.cwd()) {
  const raw = path.join(repoRoot, 'static', urlPath);
  if (existsSync(raw)) return raw;
  try {
    const decoded = path.join(repoRoot, 'static', decodeURIComponent(urlPath));
    if (existsSync(decoded)) return decoded;
  } catch {
    /* malformed escapes */
  }
  return null;
}

// Every /wp-content/ url path referenced by any article, deduped.
export function listReferencedWpContent(pagesDir = 'pages') {
  const found = new Set();

  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.mdx?$/.test(entry.name)) {
        const content = readFileSync(full, 'utf8');
        for (const m of content.matchAll(
          /https?:\/\/(?:www\.)?swizec\.com(\/wp-content\/[^\s"'<>)]+)/gi,
        )) {
          found.add(m[1].split(/[?#]/)[0]);
        }
      }
    }
  };
  walk(pagesDir);

  return [...found];
}
