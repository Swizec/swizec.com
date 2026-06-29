import { sql } from '@vercel/postgres';
import { Suspense } from 'react';

interface RelatedArticle {
    url: string;
    title: string;
}

async function RelatedArticlesList({ url }: { url: string }) {
    let articles: RelatedArticle[] = [];

    try {
        const { rows } = await sql<RelatedArticle>`
            WITH current_embedding AS (
                SELECT embedding FROM article_embeddings WHERE url = ${url} LIMIT 1
            )
            SELECT a.url, a.title
            FROM article_embeddings a, current_embedding c
            WHERE a.url != ${url}
            ORDER BY a.embedding <=> c.embedding
            LIMIT 5
        `;
        articles = rows;
    } catch {
        return null;
    }

    if (!articles.length) return null;

    return (
        <section>
            <h3>Related Articles</h3>
            <ul>
                {articles.map((article) => (
                    <li key={article.url}>
                        <a href={article.url}>{article.title}</a>
                    </li>
                ))}
            </ul>
        </section>
    );
}

export function RelatedArticles({ url }: { url: string }) {
    return (
        <Suspense fallback={null}>
            <RelatedArticlesList url={url} />
        </Suspense>
    );
}
