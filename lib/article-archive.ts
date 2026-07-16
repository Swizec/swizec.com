import { getCategory } from './categories';
import { getArticlesByPattern, getPagesUnder, type ListedArticle } from './article-listings';

export const ARCHIVE_PAGE_SIZE = 30;

// What an archive page lists. Exactly one of these (or none = all blog articles):
// - pattern: category-regex over blog articles (collections pages, /blog with none)
// - prefix: pages under a path (interviews)
// - categorySlug: a /categories/[slug] listing
export interface ArchiveQuery {
    pattern?: string;
    prefix?: string;
    categorySlug?: string;
}

// Frontmatter encoding for MDX listing pages: either a category-regex
// ("React|Reactjs") or "prefix:interviews/" for path-based listings.
export function parseArchiveFrontmatter(value: string): ArchiveQuery {
    if (value.startsWith('prefix:')) return { prefix: value.slice('prefix:'.length) };
    if (value === 'all') return {};
    return { pattern: value };
}

export async function queryArchive(query: ArchiveQuery): Promise<ListedArticle[]> {
    if (query.categorySlug) {
        const category = await getCategory(query.categorySlug);
        return (category?.articles ?? []).map((a) => ({
            path: a.path,
            title: a.title,
            description: a.description,
            published: a.published,
        }));
    }
    if (query.prefix) return getPagesUnder(query.prefix);
    return getArticlesByPattern(query.pattern ?? null);
}

export interface ArchiveMonth {
    month: number;
    count: number;
}

export interface ArchiveYear {
    year: number;
    count: number;
    months: ArchiveMonth[];
}

// Year/month counts for the time-jump sidebar, newest year first.
// Cheap single pass over compact rows — no caching needed.
export function buildTimeIndex(articles: ListedArticle[]): ArchiveYear[] {
    const years = new Map<number, Map<number, number>>();

    for (const article of articles) {
        const date = new Date(article.published);
        if (Number.isNaN(date.valueOf())) continue;
        const year = date.getUTCFullYear();
        const month = date.getUTCMonth() + 1;
        const months = years.get(year) ?? new Map<number, number>();
        months.set(month, (months.get(month) ?? 0) + 1);
        years.set(year, months);
    }

    return [...years.entries()]
        .map(([year, months]) => ({
            year,
            count: [...months.values()].reduce((a, b) => a + b, 0),
            months: [...months.entries()]
                .map(([month, count]) => ({ month, count }))
                .sort((a, b) => b.month - a.month),
        }))
        .sort((a, b) => b.year - a.year);
}

export function filterByTime(
    articles: ListedArticle[],
    year?: number,
    month?: number
): ListedArticle[] {
    if (!year) return articles;
    return articles.filter((article) => {
        const date = new Date(article.published);
        if (Number.isNaN(date.valueOf())) return false;
        if (date.getUTCFullYear() !== year) return false;
        if (month && date.getUTCMonth() + 1 !== month) return false;
        return true;
    });
}

export interface ArchivePage {
    items: ListedArticle[];
    page: number;
    totalPages: number;
    total: number;
}

export function paginate(articles: ListedArticle[], page: number): ArchivePage {
    const total = articles.length;
    const totalPages = Math.max(1, Math.ceil(total / ARCHIVE_PAGE_SIZE));
    const current = Math.min(Math.max(1, page), totalPages);
    return {
        items: articles.slice((current - 1) * ARCHIVE_PAGE_SIZE, current * ARCHIVE_PAGE_SIZE),
        page: current,
        totalPages,
        total,
    };
}

export const MONTH_NAMES = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];
