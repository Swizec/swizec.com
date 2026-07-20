import type { Metadata } from '@timber-js/app/server';
import { ArticleArchive } from '../../components/article-archive';
import { ArchiveSidebar } from '../../components/archive-sidebar';
import { SmartLink } from '../../components/link';

export const metadata: Metadata = {
    title: 'Latest articles',
    description:
        'Software engineering lessons from production — almost 20 years of articles by Swizec Teller',
};

export default function BlogIndex() {
    return (
        <>
            <main>
                <h1>Articles</h1>
                <p>
                    Software engineering lessons from production, raw and honest from the heart —
                    almost 20 years of them. Jump to a year in the sidebar, or browse{' '}
                    <SmartLink href="/categories">categories</SmartLink> and{' '}
                    <SmartLink href="/collections">curated collections</SmartLink>.
                </p>
                <ArticleArchive query={{}} basePath="/blog" />
            </main>
            <ArchiveSidebar query={{}} basePath="/blog" />
        </>
    );
}
