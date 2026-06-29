import { allPages } from 'content-collections';
import type { Metadata } from '@timber-js/app/server';

export const metadata: Metadata = {
    title: 'Collections',
    description: 'Articles by Swizec Teller, organized by topic',
};

function slugify(category: string): string {
    return category
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function buildCategoryIndex() {
    const counts = new Map<string, { name: string; count: number }>();

    for (const page of allPages) {
        if (!page.published || !page.categories) continue;
        for (const cat of page.categories.split(',')) {
            const name = cat.trim();
            if (!name) continue;
            const slug = slugify(name);
            const existing = counts.get(slug);
            if (existing) {
                existing.count++;
            } else {
                counts.set(slug, { name, count: 1 });
            }
        }
    }

    return [...counts.entries()]
        .map(([slug, { name, count }]) => ({ slug, name, count }))
        .sort((a, b) => b.count - a.count);
}

export default function CollectionsIndex() {
    const categories = buildCategoryIndex();

    return (
        <main>
            <h1>Collections</h1>
            <p>Articles organized by topic</p>
            <ul>
                {categories.map(({ slug, name, count }) => (
                    <li key={slug}>
                        <a href={`/collections/${slug}`}>{name}</a>
                        {' '}({count})
                    </li>
                ))}
            </ul>
        </main>
    );
}
