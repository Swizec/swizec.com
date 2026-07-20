// pages/about.mdx renders the hat icon inline as ![](/favicon.png) — the
// Gatsby site served it from static/. Serve the tracked source at the same
// stable URL; ?inline keeps it out of the copy scripts (it's 183 bytes).
import faviconInline from '../../static/favicon.png?inline';

const bytes = Uint8Array.from(atob(faviconInline.split(',')[1]), (c) => c.charCodeAt(0));

export function GET(): Response {
    return new Response(bytes, {
        headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=86400, s-maxage=604800',
        },
    });
}
