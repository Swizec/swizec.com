import { allPages } from 'content-collections';
import { cache } from '@timber-js/app/cache';

export interface ListedArticle {
    path: string;
    title: string;
    description?: string;
    published: string;
}

function toListed(page: {
    _meta: { path: string };
    title: string;
    description?: string;
    published?: string;
}): ListedArticle {
    return {
        path: `/${page._meta.path.replace(/\/index$/, '')}`,
        title: page.title,
        description: page.description,
        published: page.published ?? '',
    };
}

// Blog articles whose categories frontmatter matches a pattern —
// case-insensitive substring semantics, same as the old Gatsby regex
// filters (e.g. "React|Reactjs|React.js|gatsby|nextjs"). Null pattern
// means all blog articles. Compact rows only, cached cross-request.
export const getArticlesByPattern = cache(
    async (pattern: string | null, limit?: number): Promise<ListedArticle[]> => {
        const regex = pattern ? new RegExp(pattern, 'i') : null;

        const articles = allPages
            .filter((p) => p._meta.path.startsWith('blog/') && p.published)
            .filter((p) => !regex || (p.categories && regex.test(p.categories)))
            .map(toListed)
            .sort((a, b) => b.published.localeCompare(a.published));

        return limit ? articles.slice(0, limit) : articles;
    },
    { ttl: 3600, staleWhileRevalidate: true, tags: ['articles'] }
);

// Non-blog pages under a prefix (e.g. "interviews/"), newest first.
export const getPagesUnder = cache(
    async (prefix: string): Promise<ListedArticle[]> => {
        return allPages
            .filter(
                (p) =>
                    p._meta.path.startsWith(prefix) &&
                    p._meta.path !== `${prefix}index` &&
                    p.published
            )
            .map(toListed)
            .sort((a, b) => b.published.localeCompare(a.published));
    },
    { ttl: 3600, staleWhileRevalidate: true, tags: ['articles'] }
);
