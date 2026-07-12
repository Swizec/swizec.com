import { deny, getSegmentParams } from '@timber-js/app/server';
import type { Metadata } from '@timber-js/app/server';
import { getCategory } from '../../../lib/categories';

function resolvedSlug(): string {
    const { categorySlug } = getSegmentParams();
    return Array.isArray(categorySlug) ? (categorySlug[0] ?? '') : (categorySlug ?? '');
}

export async function metadata(): Promise<Metadata> {
    const category = await getCategory(resolvedSlug());
    if (!category) return {};
    return {
        title: category.name,
        description: `Articles about ${category.name} by Swizec Teller`,
    };
}

export default async function CollectionPage() {
    const category = await getCategory(resolvedSlug());

    if (!category) {
        deny(404);
        return null;
    }

    return (
        <main>
            <h1>{category.name}</h1>
            <p>{category.articles.length} articles</p>
            <ul>
                {category.articles.map(({ path, title, published }) => (
                    <li key={path}>
                        <a href={path}>{title}</a>
                        <time dateTime={published}>
                            {' '}
                            —{' '}
                            {new Date(published).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                            })}
                        </time>
                    </li>
                ))}
            </ul>
        </main>
    );
}
