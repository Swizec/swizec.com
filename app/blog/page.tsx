import type { Metadata } from '@timber-js/app/server';
import { archiveParams } from '../../lib/archive-params';
import { archiveOgQuery, archiveTimeLabel } from '../../lib/archive-metadata';
import { SITE_URL } from '../../lib/structured-data';
import { requestOrigin } from '../mdx-metadata';
import { ArticleArchive } from '../../components/article-archive';
import { ArchiveSidebar } from '../../components/archive-sidebar';
import { SmartLink } from '../../components/link';

// Title, description, and og-image all reflect the active ?year/?month filter
// (and deep page number) — a link to the 2019 archive shouldn't unfurl the
// same as a link to 2026, and crawlers shouldn't see hundreds of identical
// titles.
export function metadata(): Metadata {
    const { year, month: rawMonth, page } = archiveParams.get();
    // A month without a year doesn't filter anything — keep it out of the
    // title and canonical.
    const month = year ? rawMonth : undefined;
    const label = archiveTimeLabel(year, month);
    const baseTitle = label ? `Articles from ${label}` : 'Latest articles';
    const title = page > 1 ? `${baseTitle} · page ${page}` : baseTitle;
    const description = label
        ? `Software engineering lessons from production — articles from ${label} by Swizec Teller`
        : 'Software engineering lessons from production — almost 20 years of articles by Swizec Teller';
    const ogImage = `${requestOrigin()}/blog/opengraph-image.png${archiveOgQuery(year, month)}`;
    const query = archiveParams.serialize({ year, month, page });

    return {
        title,
        description,
        alternates: { canonical: `${SITE_URL}/blog${query ? `?${query}` : ''}` },
        openGraph: {
            title,
            description,
            images: { url: ogImage, alt: title },
        },
        twitter: {
            card: 'summary_large_image',
            site: '@swizec',
            images: { url: ogImage, alt: title },
        },
    };
}

export default function BlogIndex() {
    return (
        <>
            <main>
                <h1>Articles</h1>
                <p>
                    Software engineering lessons from production, raw and honest from the heart —
                    almost 20 years of them. Jump to a year in the sidebar, or browse{' '}
                    <SmartLink href="/categories">categories</SmartLink>.
                </p>
                <ArticleArchive query={{}} basePath="/blog" />
            </main>
            <ArchiveSidebar query={{}} basePath="/blog" />
        </>
    );
}
