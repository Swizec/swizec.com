// Resolves a page's `hero` frontmatter to a servable URL. Heroes are paths
// relative to the MDX file (e.g. `./img/x.png`), so they resolve against the
// file's directory under pages/ — served at `/page-assets/<path>` by the dev
// middleware (vite.config.ts) and the build copy step (scripts/copy-og-assets).
//
// Plain ESM so it can be shared by the Vite config, the build script, and the
// app's metadata (imported through Vite/esbuild) without duplication.
import path from 'node:path';

// Path under pages/ for a colocated hero, or null when the hero is absent,
// remote, already site-absolute, or escapes pages/ (broken legacy depth).
export function heroRelPath(directory, hero) {
    if (!hero) return null;
    if (/^https?:\/\//.test(hero) || hero.startsWith('/')) return null;
    const base = !directory || directory === '.' ? '' : directory;
    const rel = path.posix.normalize(path.posix.join(base, hero));
    if (rel.startsWith('..') || rel.startsWith('/') || rel === '.') return null;
    return rel;
}

// Public URL for a page's hero, or null when there's no usable hero.
// Remote URLs pass through; site-absolute paths pass through; colocated
// files become `/page-assets/<path>`.
export function heroUrl(directory, hero) {
    if (!hero) return null;
    if (/^https?:\/\//.test(hero) || hero.startsWith('/')) return hero;
    const rel = heroRelPath(directory, hero);
    return rel ? `/page-assets/${rel}` : null;
}
