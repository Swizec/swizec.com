import { deny, getSegmentParams } from '@timber-js/app/server';
import type { Metadata } from '@timber-js/app/server';
import { getCategory } from '../../../lib/categories';
import { archiveParams } from '../../../lib/archive-params';
import { archiveOgQuery, archiveTimeLabel } from '../../../lib/archive-metadata';
import { requestOrigin } from '../../mdx-metadata';
import { ArticleArchive } from '../../../components/article-archive';
import { ArchiveSidebar } from '../../../components/archive-sidebar';
import { SmartLink } from '../../../components/link';
import { NewsletterSignup } from '../../../components/newsletter-signup';
import { CATEGORY_INTROS } from '../../../components/category-intros';
import { JsonLd } from 'react-schemaorg';
import { SITE_URL, breadcrumbsJsonLd } from '../../../lib/structured-data';

function resolvedSlug(): string {
    const { categorySlug } = getSegmentParams();
    return Array.isArray(categorySlug) ? (categorySlug[0] ?? '') : (categorySlug ?? '');
}

export async function metadata(): Promise<Metadata> {
    const slug = resolvedSlug();
    const category = await getCategory(slug);
    if (!category) return {};
    // Title, description, and og-image reflect the active ?year/?month filter
    // (and deep page number) so filtered views don't all share one title.
    const { year, month: rawMonth, page } = archiveParams.get();
    // A month without a year doesn't filter anything — keep it out of the
    // title and canonical.
    const month = year ? rawMonth : undefined;
    const label = archiveTimeLabel(year, month);
    const baseTitle = label ? `${category.name} — ${label}` : category.name;
    const title = page > 1 ? `${baseTitle} · page ${page}` : baseTitle;
    const description = label
        ? `Articles about ${category.name} from ${label} by Swizec Teller`
        : `Articles about ${category.name} by Swizec Teller`;
    const ogImage = `${requestOrigin()}/categories/${slug}/opengraph-image.png${archiveOgQuery(year, month)}`;
    const query = archiveParams.serialize({ year, month, page });
    return {
        title,
        description,
        alternates: { canonical: `${SITE_URL}/categories/${slug}${query ? `?${query}` : ''}` },
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

export default async function CategoryPage() {
    const slug = resolvedSlug();
    const category = await getCategory(slug);

    if (!category) {
        deny(404);
        return null;
    }

    const query = { categorySlug: slug };
    const basePath = `/categories/${slug}`;
    const intro = CATEGORY_INTROS[slug];

    return (
        <>
            <JsonLd
                item={breadcrumbsJsonLd([
                    { name: 'Home', url: SITE_URL },
                    { name: 'Categories', url: `${SITE_URL}/categories` },
                    { name: category.name },
                ])}
            />
            <main>
                <h1>{category.name}</h1>
                <p>
                    {category.articles.length} articles ·{' '}
                    <SmartLink href="/categories">all categories</SmartLink>
                </p>
                {intro && (
                    <>
                        <p>{intro.blurb}</p>
                        <NewsletterSignup formKey={intro.formKey} />
                    </>
                )}
                <ArticleArchive
                    query={query}
                    basePath={basePath}
                    heading={`${category.name} articles`}
                />
            </main>
            <ArchiveSidebar query={query} basePath={basePath} />
        </>
    );
}
