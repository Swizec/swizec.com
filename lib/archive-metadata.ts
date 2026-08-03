import type { Metadata } from '@timber-js/app/server';
import { archiveParams } from './archive-params';
import { MONTH_NAMES } from './article-archive';

// "May 2025", "2025", or undefined when the view isn't time-filtered.
export function archiveTimeLabel(year?: number, month?: number): string | undefined {
    if (!year) return undefined;
    return month ? `${MONTH_NAMES[month - 1]} ${year}` : String(year);
}

// Query string ("?year=2025&month=5") that carries the active time filter to a
// generated og-image route, so the card can render the date. Empty when
// unfiltered.
export function archiveOgQuery(year?: number, month?: number): string {
    if (!year) return '';
    return `?${archiveParams.serialize({ year, month })}`;
}

function suffixImages<
    T extends Metadata['openGraph'] | Metadata['twitter'],
>(section: T, ogQuery: string, title: string): T {
    if (!section) return section;
    const images = (section as { images?: unknown }).images;
    if (!images || typeof images !== 'object' || Array.isArray(images)) return section;
    const image = images as { url: string; alt?: string };
    if (!image.url.endsWith('/opengraph-image.png')) return section;
    return {
        ...section,
        title,
        images: { ...image, url: `${image.url}${ogQuery}`, alt: title },
    };
}

// Suffix a listing page's metadata with the active ?year/?month filter and deep
// page number, so filtered and paginated views don't all share one title and
// unfurl card — distinct for crawlers, oriented-in-time for humans. Also points
// the generated og-image at the same filter and makes the canonical
// self-referential. No-op on the unfiltered first page.
export function withArchiveTime(meta: Metadata): Metadata {
    const { year, month: rawMonth, page } = archiveParams.get();
    // A month without a year doesn't filter anything — don't let it leak into
    // titles or canonicals.
    const month = year ? rawMonth : undefined;
    const label = archiveTimeLabel(year, month);
    if (!label && page === 1) return meta;
    if (typeof meta.title !== 'string') return meta;

    const suffix = [label, page > 1 ? `page ${page}` : undefined].filter(Boolean).join(' · ');
    const title = `${meta.title} — ${suffix}`;
    const description =
        label && meta.description
            ? `${meta.description} Showing articles from ${label}.`
            : meta.description;
    const ogQuery = archiveOgQuery(year, month);
    const canonical = (meta.alternates as { canonical?: string } | undefined)?.canonical;

    return {
        ...meta,
        title,
        description,
        ...(canonical && {
            alternates: {
                ...meta.alternates,
                canonical: `${canonical}?${archiveParams.serialize({ year, month, page })}`,
            },
        }),
        openGraph: suffixImages(meta.openGraph, ogQuery, title),
        twitter: suffixImages(meta.twitter, ogQuery, title),
    };
}
