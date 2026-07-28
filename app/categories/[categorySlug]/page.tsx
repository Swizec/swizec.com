import { deny, getSegmentParams } from '@timber-js/app/server';
import type { Metadata } from '@timber-js/app/server';
import { getCategory } from '../../../lib/categories';
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
    const category = await getCategory(resolvedSlug());
    if (!category) return {};
    return {
        title: category.name,
        description: `Articles about ${category.name} by Swizec Teller`,
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
                <ArticleArchive query={query} basePath={basePath} />
            </main>
            <ArchiveSidebar query={query} basePath={basePath} />
        </>
    );
}
