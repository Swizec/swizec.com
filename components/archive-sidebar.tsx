import { archiveParams } from '../lib/archive-params';
import {
    MONTH_NAMES,
    buildTimeIndex,
    queryArchive,
    type ArchiveQuery,
} from '../lib/article-archive';

// Time-jump rail for listing pages: almost 20 years of archive, browsable by
// year, then by month within the active year. Replaces the book sidebar.
export async function ArchiveSidebar({
    query,
    basePath,
}: {
    query: ArchiveQuery;
    basePath: string;
}) {
    const { year: activeYear, month: activeMonth } = archiveParams.get();
    const articles = await queryArchive(query);
    const years = buildTimeIndex(articles);

    if (years.length === 0) return null;

    return (
        <aside className="archive-sidebar" aria-label="Browse the archive by date">
            <h2>Jump in time</h2>
            <nav>
                <a href={basePath} className={activeYear ? '' : 'archive-active'}>
                    All time ({articles.length})
                </a>
                {years.map(({ year, count, months }) => (
                    <div key={year} className="archive-year">
                        <a
                            href={archiveParams.href(basePath, { year })}
                            className={activeYear === year && !activeMonth ? 'archive-active' : ''}
                        >
                            {year} ({count})
                        </a>
                        {activeYear === year && (
                            <div className="archive-months">
                                {months.map(({ month, count: monthCount }) => (
                                    <a
                                        key={month}
                                        href={archiveParams.href(basePath, { year, month })}
                                        className={activeMonth === month ? 'archive-active' : ''}
                                    >
                                        {MONTH_NAMES[month - 1]} ({monthCount})
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </nav>
        </aside>
    );
}
