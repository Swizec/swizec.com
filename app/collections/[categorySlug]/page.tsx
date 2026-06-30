import { allPages } from 'content-collections';
import { deny, getSegmentParams } from '@timber-js/app/server';
import type { Metadata } from '@timber-js/app/server';
import { slugify } from '../../../lib/categories';

function getCategoryName(slug: string): string | undefined {
    for (const page of allPages) {
        if (!page.published || !page.categories) continue;
        for (const cat of page.categories.split(',')) {
            const trimmed = cat.trim();
            if (slugify(trimmed) === slug) return trimmed;
        }
    }
    return undefined;
}

function getArticlesForSlug(slug: string) {
    return allPages
        .filter((page) => {
            if (!page.published || !page.categories) return false;
            return page.categories
                .split(',')
                .some((cat) => slugify(cat.trim()) === slug);
        })
        .sort((a, b) => (b.published ?? '').localeCompare(a.published ?? ''));
}

function resolvedSlug(): string {
    const params = getSegmentParams();
    return Array.isArray(params.categorySlug) ? params.categorySlug.join('/') : (params.categorySlug ?? '');
}

export async function metadata(): Promise<Metadata> {
    const slug = resolvedSlug();
    const categoryName = getCategoryName(slug);
    if (!categoryName) return {};
    return {
        title: categoryName,
        description: `Articles about ${categoryName} by Swizec Teller`,
    };
}

export default function CollectionPage() {
    const slug = resolvedSlug();
    const articles = getArticlesForSlug(slug);

    if (!articles.length) {
        deny(404);
        return null;
    }

    const categoryName = getCategoryName(slug) ?? slug;

    return (
        <main>
            <h1>{categoryName}</h1>
            <p>{articles.length} articles</p>
            <ul>
                {articles.map((page) => {
                    const href = `/${page._meta.path.replace(/\/index$/, '')}`;
                    return (
                        <li key={page._meta.path}>
                            <a href={href}>{page.title}</a>
                            {page.published && (
                                <time dateTime={page.published}>
                                    {' '}
                                    —{' '}
                                    {new Date(page.published).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                </time>
                            )}
                        </li>
                    );
                })}
            </ul>
        </main>
    );
}
