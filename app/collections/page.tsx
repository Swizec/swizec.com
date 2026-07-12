import type { Metadata } from '@timber-js/app/server';
import { listCategories } from '../../lib/categories';

export const metadata: Metadata = {
    title: 'Collections',
    description: 'Articles by Swizec Teller, organized by topic',
};

export default async function CollectionsIndex() {
    const categories = await listCategories();

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
