import type { Metadata } from '@timber-js/app/server';
import { listCategories } from '../../lib/categories';
import { PageShell } from '../../components/page-shell';

export const metadata: Metadata = {
    title: 'Categories',
    description: 'Articles by Swizec Teller, organized by topic',
};

export default async function CategoriesIndex() {
    const categories = await listCategories();

    return (
        <PageShell>
        <main>
            <h1>Categories</h1>
            <p>Articles organized by topic</p>
            <ul>
                {categories.map(({ slug, name, count }) => (
                    <li key={slug}>
                        <a href={`/categories/${slug}`}>{name}</a>
                        {' '}({count})
                    </li>
                ))}
            </ul>
        </main>
        </PageShell>
    );
}
