import { ImageResponse } from 'takumi-js/response';
import { getSegmentParams } from '@timber-js/app/server';
import { getCategory } from '../../../lib/categories';
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

    const description =
        CATEGORY_INTROS[slug]?.blurb ??
        `${category.articles.length} articles about ${category.name} by Swizec Teller`;

    return new ImageResponse(
        <OgCard title={category.name} description={description} seed={`categories/${slug}`} />,
        ogImageOptions,
    );
}
