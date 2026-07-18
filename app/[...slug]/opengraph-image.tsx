import { ImageResponse } from '@vercel/og';
import { allPages } from 'content-collections';
import { getSegmentParams } from '@timber-js/app/server';
import { OgCard } from '../../components/og-card';
import { ogFonts } from '../../components/og-fonts';

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

    return new ImageResponse(
        <OgCard title={page.title} description={page.description} seed={page._meta.path} />,
        {
            width: 1200,
            height: 630,
            fonts: ogFonts,
        },
    );
}
