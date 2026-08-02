import { ImageResponse } from 'takumi-js/response';
import { archiveParams } from '../../lib/archive-params';
import { archiveTimeLabel } from '../../lib/archive-metadata';
import { filterByTime, queryArchive } from '../../lib/article-archive';
import { OgCard } from '../../components/og-card';
import { ogImageOptions } from '../../components/og-image';

// The /blog listing card, date-aware: ?year/?month render the filtered
// period's title and article count so shared archive links unfurl distinctly.
export default async function OGImage() {
    const { year, month } = archiveParams.get();
    const label = archiveTimeLabel(year, month);

    let title = 'Latest articles';
    let description =
        'Software engineering lessons from production — almost 20 years of articles.';
    if (label) {
        title = `Articles from ${label}`;
        const count = filterByTime(await queryArchive({}), year, month).length;
        description = `${count} article${count === 1 ? '' : 's'} · Software engineering lessons from production.`;
    }

    return new ImageResponse(
        <OgCard title={title} description={description} seed={`blog/${label ?? 'all'}`} />,
        ogImageOptions,
    );
}
