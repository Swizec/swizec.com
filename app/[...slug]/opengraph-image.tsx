import { ImageResponse } from '@vercel/og';
import { allPages } from 'content-collections';
import { getSegmentParams } from '@timber-js/app/server';

function resolvedPath(): string {
    const { slug } = getSegmentParams();
    return Array.isArray(slug) ? slug.join('/') : (slug ?? '');
}

function findPage(path: string) {
    return allPages.find((p) => p._meta.path === path || p._meta.path === `${path}/index`);
}

export default async function OGImage() {
    const path = resolvedPath();
    const page = findPage(path);

    if (!page) {
        return new Response(null, { status: 404 });
    }

    const heroImage = page.hero ?? page.image;

    if (heroImage && (heroImage.startsWith('http://') || heroImage.startsWith('https://'))) {
        return Response.redirect(heroImage, 302);
    }

    return new ImageResponse(
        <div
            tw="flex flex-col justify-between w-full h-full px-20 py-16"
            style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}
        >
            <div tw="flex flex-col">
                <div
                    tw="text-6xl font-bold tracking-tight mt-4 leading-tight"
                    style={{ color: '#ffffff' }}
                >
                    {page.title}
                </div>
                {page.description && (
                    <div tw="text-3xl mt-4" style={{ color: '#a0a0a0' }}>
                        {page.description}
                    </div>
                )}
            </div>
            <div tw="flex items-center">
                <div tw="text-2xl font-bold" style={{ color: '#f0a500' }}>
                    swizec.com
                </div>
            </div>
        </div>,
        { width: 1200, height: 630 }
    );
}
