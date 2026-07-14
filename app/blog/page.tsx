import type { Metadata } from '@timber-js/app/server';
import { PageShell } from '../../components/page-shell';
import { ArticleArchive } from '../../components/article-archive';
import { ArchiveSidebar } from '../../components/archive-sidebar';

export const metadata: Metadata = {
    title: 'Latest articles',
    description:
        'Software engineering lessons from production — almost 20 years of articles by Swizec Teller',
};

export default function BlogIndex() {
    return (
        <PageShell sidebar={<ArchiveSidebar query={{}} basePath="/blog" />}>
            <main>
                <h1>Articles</h1>
                <p>
                    Software engineering lessons from production, raw and honest from the heart —
                    almost 20 years of them. Jump to a year in the sidebar, or browse{' '}
                    <a href="/categories">categories</a> and{' '}
                    <a href="/collections">curated collections</a>.
                </p>
                <ArticleArchive query={{}} basePath="/blog" />
            </main>
        </PageShell>
    );
}
