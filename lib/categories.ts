import { allPages } from 'content-collections';
import { cache } from '@timber-js/app/cache';

export function slugify(category: string): string {
    return category
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// Parse one article's categories frontmatter ("d3js, Front End, react") into
// name + listing-slug pairs. Cheap and local — no collection scan.
export function parseCategories(categories: string | undefined): { name: string; slug: string }[] {
    if (!categories) return [];
    return categories
        .split(',')
        .map((cat) => cat.trim())
        .filter(Boolean)
        .map((name) => ({ name, slug: slugify(name) }));
}

export interface CategoryArticle {
    path: string;
    title: string;
    published: string;
}

export interface Category {
    name: string;
    slug: string;
    articles: CategoryArticle[];
}

// One pass over the collection builds a compact slug → category index holding
// only the fields the listing pages render (path/title/published) — never the
// full documents with article bodies. cache() shares it across requests with
// singleflight, so each server instance computes it once per TTL window
// instead of re-scanning ~2k documents on every request. Content only changes
// at deploy time and the cache identity is content-derived, so a code change
// invalidates the entry automatically.
export const getCategoryIndex = cache(
    async (): Promise<Record<string, Category>> => {
        const index: Record<string, Category> = {};

        for (const page of allPages) {
            if (!page.published) continue;
            const path = `/${page._meta.path.replace(/\/index$/, '')}`;
            for (const { name, slug } of parseCategories(page.categories)) {
                index[slug] ??= { name, slug, articles: [] };
                index[slug].articles.push({ path, title: page.title, published: page.published });
            }
        }

        for (const category of Object.values(index)) {
            category.articles.sort((a, b) => b.published.localeCompare(a.published));
        }

        return index;
    },
    { ttl: 3600, staleWhileRevalidate: true, tags: ['categories'] }
);

export async function getCategory(slug: string): Promise<Category | undefined> {
    const index = await getCategoryIndex();
    return index[slug];
}

// Categories sorted by article count for the /category index page.
export async function listCategories(): Promise<{ name: string; slug: string; count: number }[]> {
    const index = await getCategoryIndex();
    return Object.values(index)
        .map(({ name, slug, articles }) => ({ name, slug, count: articles.length }))
        .sort((a, b) => b.count - a.count);
}
