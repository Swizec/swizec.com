import { ImageResponse } from 'takumi-js/response';
import { getSegmentParams } from '@timber-js/app/server';
import { getCategory } from '../../../lib/categories';
import { archiveParams } from '../../../lib/archive-params';
import { archiveTimeLabel } from '../../../lib/archive-metadata';
import { filterByTime } from '../../../lib/article-archive';
import { CATEGORY_INTROS } from '../../../components/category-intros';
import { OgCard } from '../../../components/og-card';
import { ogImageOptions } from '../../../components/og-image';

function resolvedSlug(): string {
    const { categorySlug } = getSegmentParams();
    return Array.isArray(categorySlug) ? (categorySlug[0] ?? '') : (categorySlug ?? '');
}

export default async function OGImage() {
    const slug = resolvedSlug();
    const category = await getCategory(slug);

    if (!category) {
        return new Response(null, { status: 404 });
    }

    // ?year/?month render the filtered period's title and count so shared
    // archive links unfurl distinctly.
    const { year, month } = archiveParams.get();
    const label = archiveTimeLabel(year, month);

    let title = category.name;
    let description =
        CATEGORY_INTROS[slug]?.blurb ??
        `${category.articles.length} articles about ${category.name} by Swizec Teller`;
    if (label) {
        title = `${category.name} — ${label}`;
        const count = filterByTime(category.articles, year, month).length;
        description = `${count} article${count === 1 ? '' : 's'} about ${category.name} from ${label} by Swizec Teller`;
    }

    return new ImageResponse(
        <OgCard
            title={title}
            description={description}
            seed={label ? `categories/${slug}/${label}` : `categories/${slug}`}
        />,
        ogImageOptions,
    );
}
