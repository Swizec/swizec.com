// Served as a route because public/ is gitignored (stale Gatsby build output
// lives there locally), so files in it never reach deploys. Icon URLs come
// from Vite asset imports — hashed, so they cache-bust with the image.
// ?no-inline: manifest icons must be fetchable URLs, not data URIs — the
// files are under Vite's 4KB inline limit and would otherwise be inlined.
import icon192 from '../assets/favicons/icon-192.png?no-inline';
import icon512 from '../assets/favicons/icon-512.png?no-inline';

const manifest = {
    name: 'swizec.com',
    short_name: 'swizec.com',
    description:
        'Swizec shares software engineering lessons from production in his books, articles, talks, and workshops',
    start_url: '/',
    display: 'standalone',
    background_color: '#CCCFFA',
    theme_color: '#CCCFFA',
    icons: [
        { src: icon192, sizes: '192x192', type: 'image/png' },
        { src: icon512, sizes: '512x512', type: 'image/png' },
    ],
};

export function GET(): Response {
    return new Response(JSON.stringify(manifest), {
        headers: {
            'Content-Type': 'application/manifest+json',
            'Cache-Control': 'public, max-age=3600, s-maxage=86400',
        },
    });
}
