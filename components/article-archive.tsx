import { archiveParams } from '../lib/archive-params';
import {
    MONTH_NAMES,
    archiveHref,
    filterByTime,
    paginate,
    queryArchive,
    type ArchiveQuery,
} from '../lib/article-archive';
import { ArticleListing } from './article-listing';
import type { ListedArticle } from '../lib/article-listings';

// Interleaves "Month Year" markers before the first article of each month, so
// readers stay oriented in time as they scroll. Skipped when the view is
// already narrowed to a single month (every marker would be identical).
function withTimeMarkers(
    articles: ListedArticle[],
    activeMonth?: number
): { marker?: string; article?: ListedArticle }[] {
    if (activeMonth) return articles.map((article) => ({ article }));

    const out: { marker?: string; article?: ListedArticle }[] = [];
    let lastKey = '';
    for (const article of articles) {
        const date = new Date(article.published);
        if (!Number.isNaN(date.valueOf())) {
            const key = `${date.getUTCFullYear()}-${date.getUTCMonth()}`;
            if (key !== lastKey) {
                out.push({ marker: `${MONTH_NAMES[date.getUTCMonth()]} ${date.getUTCFullYear()}` });
                lastKey = key;
            }
        }
        out.push({ article });
    }
    return out;
}

function Pagination({
    basePath,
    page,
    totalPages,
    year,
    month,
}: {
    basePath: string;
    page: number;
    totalPages: number;
    year?: number;
    month?: number;
}) {
    if (totalPages <= 1) return null;

    return (
        <nav className="archive-pagination" aria-label="Pagination">
            {page > 1 ? (
                <a className="button" href={archiveHref(basePath, { year, month, page: page - 1 })}>
                    ← Newer
                </a>
            ) : (
                <span className="button archive-pagination-disabled">← Newer</span>
            )}
            <span className="archive-pagination-status">
                Page {page} of {totalPages}
            </span>
            {page < totalPages ? (
                <a className="button" href={archiveHref(basePath, { year, month, page: page + 1 })}>
                    Older →
                </a>
            ) : (
                <span className="button archive-pagination-disabled">Older →</span>
            )}
        </nav>
    );
}

// Paginated, time-filterable article listing driven by ?page/?year/?month.
// Used by every long-list page: /blog, category pages, collections, interviews.
export async function ArticleArchive({
    query,
    basePath,
}: {
    query: ArchiveQuery;
    basePath: string;
}) {
    const { page: requestedPage, year, month } = archiveParams.get();
    const all = await queryArchive(query);
    const filtered = filterByTime(all, year, month);
    const { items, page, totalPages, total } = paginate(filtered, requestedPage);

    return (
        <section className="article-archive">
            {year && (
                <p className="archive-filter-note">
                    {total} article{total === 1 ? '' : 's'} from{' '}
                    <strong>
                        {month ? `${MONTH_NAMES[month - 1]} ` : ''}
                        {year}
                    </strong>{' '}
                    · <a href={basePath}>show all</a>
                </p>
            )}
            {items.length === 0 ? (
                <p>Nothing here — try another year or clear the filter.</p>
            ) : (
                withTimeMarkers(items, month).map((entry) =>
                    entry.marker ? (
                        <h2 className="archive-time-marker" key={entry.marker}>
                            {entry.marker}
                        </h2>
                    ) : (
                        <ArticleListing key={entry.article!.path} article={entry.article!} />
                    )
                )
            )}
            <Pagination
                basePath={basePath}
                page={page}
                totalPages={totalPages}
                year={year}
                month={month}
            />
        </section>
    );
}
