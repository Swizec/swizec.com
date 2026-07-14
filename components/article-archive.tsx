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
                items.map((article) => <ArticleListing key={article.path} article={article} />)
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
