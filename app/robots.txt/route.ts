// Served as a route because public/ is gitignored (stale Gatsby build output
// lives there locally), so files in it never reach deploys.
const robots = `User-agent: *
Allow: /

Sitemap: https://swizec.com/sitemap.xml
`;

export function GET(): Response {
    return new Response(robots, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, s-maxage=86400',
        },
    });
}
