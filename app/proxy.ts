import { allPages } from 'content-collections';
// Single source of truth for static redirects: the legacy Netlify `_redirects`
// file, inlined as a string at build time by Vite. Format is "<from>  <to>" per
// line (extra whitespace and blank lines are ignored).
import redirectsFile from '../static/_redirects?raw';

// Collapse "/x" and "/x/" to one key so either form matches. Root is left alone.
function normalize(path: string): string {
    return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
}

// Built once per cold start; every request is then a single Map lookup, no async.
const redirectMap = new Map<string, string>();

for (const line of redirectsFile.split('\n')) {
    const [from, to] = line.trim().split(/\s+/);
    if (from && to) redirectMap.set(normalize(from), to);
}

// redirect_from frontmatter → canonical article path. Static entries win on
// collision, so only fill in keys the static file didn't already claim.
for (const page of allPages) {
    if (!page.redirect_from?.length) continue;
    const canonical = `/${page._meta.path.replace(/\/index$/, '')}`;
    for (const from of page.redirect_from) {
        const key = normalize(from.startsWith('/') ? from : `/${from}`);
        if (!redirectMap.has(key)) redirectMap.set(key, canonical);
    }
}

export default async function proxy(req: Request, next: () => Promise<Response>) {
    const url = new URL(req.url);
    let path = url.pathname;
    // pathname is percent-encoded; map keys use literal characters (incl. emoji),
    // so decode before lookup. Fall back to the raw path on malformed input.
    try {
        path = decodeURIComponent(path);
    } catch {
        /* keep the raw pathname */
    }

    const target = redirectMap.get(normalize(path));
    if (target) {
        const dest = target.startsWith('http') ? target : new URL(target, url.origin).href;
        return Response.redirect(dest, 301);
    }

    return next();
}
