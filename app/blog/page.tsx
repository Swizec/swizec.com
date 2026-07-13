import type { Metadata } from '@timber-js/app/server';
import { LatestArticles } from '../../components/article-listing';

export const metadata: Metadata = {
    title: 'Latest articles',
    description:
        'Software engineering lessons from production — the latest articles by Swizec Teller',
};

export default function BlogIndex() {
    return (
        <main>
            <h1>Latest articles</h1>
            <p>
                Software engineering lessons from production, raw and honest from the heart.
                Looking for something specific? Browse <a href="/categories">categories</a> or{' '}
                <a href="/collections">curated collections</a>.
            </p>
            <LatestArticles limit={30} />
            <p>
                Want more? Explore <a href="/categories">all categories</a> or subscribe to the{' '}
                <a href="/letters">newsletter</a> so you never miss a new one.
            </p>
        </main>
    );
}
