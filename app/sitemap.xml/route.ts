import { allPages } from 'content-collections';
import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'node:stream';
import { getCategoryIndex } from '../../lib/categories';

const SITE_URL = 'https://swizec.com';

// Routable pages that shouldn't be crawled: the status page, dev scaffolding,
// and post-signup / unsubscribe pages. Explicit list — a pattern could
// silently swallow a future legit slug.
const EXCLUDED = new Set([
    '404',
    'example',
    'bye',
    '5-steps-thanks',
    'scaling-fast/thanks-for-voting',
]);

// Google ignores <priority> and <changefreq>, so entries carry only the URL
// and — where we can vouch for it — <lastmod>. Articles use their publish
// date; listing pages use the newest article they list (they change exactly
// when an article ships); undated standalone pages omit lastmod rather than
// report an inaccurate one.
async function buildSitemap(): Promise<Buffer> {
    const now = new Date();
    const links: { url: string; lastmod?: string }[] = [];
    let newest: string | undefined;

    for (const page of allPages) {
        const path = page._meta.path.replace(/\/index$/, '');
        if (path === 'index') continue; // home is added below as /
        if (EXCLUDED.has(path)) continue;
        // Future-dated posts are routable but unannounced — keep them out,
        // same as the RSS feed.
        if (page.published && new Date(page.published) > now) continue;

        if (page.published && (!newest || page.published > newest)) {
            newest = page.published;
        }
        links.push({ url: `/${path}`, lastmod: page.published });
    }

    // Listing pages: home, the article archive, and per-category listings.
    links.unshift(
        { url: '/', lastmod: newest },
        { url: '/blog', lastmod: newest },
        { url: '/categories', lastmod: newest },
    );
    // Most categories are frontmatter one-offs (1,035 of ~1,520 hold a single
    // article) — thin near-duplicate listings that waste crawl budget. Only
    // categories with a real collection of articles go in the sitemap; the
    // pages themselves stay routable either way.
    for (const category of Object.values(await getCategoryIndex())) {
        if (category.articles.length < 3) continue;
        links.push({
            url: `/categories/${category.slug}`,
            lastmod: category.articles[0]?.published,
        });
    }

    // ~2k URLs — well under the 50k/50MB single-file limit, so no index file.
    const stream = new SitemapStream({ hostname: SITE_URL });
    return streamToPromise(Readable.from(links).pipe(stream));
}

// Content is fixed per deploy; build once per instance and reuse.
let cached: Promise<Buffer> | undefined;

export async function GET(): Promise<Response> {
    cached ??= buildSitemap();
    return new Response(await cached, {
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, s-maxage=86400',
        },
    });
}
