import type { Metadata } from '@timber-js/app/server';
import { listCategories } from '../../lib/categories';
import { PageShell } from '../../components/page-shell';
import { SmartLink } from '../../components/link';

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
                        <SmartLink href={`/categories/${slug}`}>{name}</SmartLink>
                        {' '}({count})
                    </li>
                ))}
            </ul>
        </main>
        </PageShell>
    );
}
