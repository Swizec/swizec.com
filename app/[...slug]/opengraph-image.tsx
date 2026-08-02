import { ImageResponse } from 'takumi-js/response';
import { allPages } from 'content-collections';
import { getSegmentParams } from '@timber-js/app/server';
import { archiveParams } from '../../lib/archive-params';
import { archiveTimeLabel } from '../../lib/archive-metadata';
import { OgCard } from '../../components/og-card';
import { ogImageOptions } from '../../components/og-image';

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

    // Listing pages carry the active ?year/?month filter in the card title so
    // shared archive links unfurl distinctly. Regular pages ignore the params.
    const { year, month } = archiveParams.get();
    const label = page.archive ? archiveTimeLabel(year, month) : undefined;
    const title = label ? `${page.title} — ${label}` : page.title;

    return new ImageResponse(
        <OgCard
            title={title}
            description={page.description}
            seed={label ? `${page._meta.path}/${label}` : page._meta.path}
        />,
        ogImageOptions,
    );
}
