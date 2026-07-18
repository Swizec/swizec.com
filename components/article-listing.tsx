import { getArticlesByPattern, getPagesUnder, type ListedArticle } from '../lib/article-listings';
import { SmartLink } from './link';

export function ArticleListing({ article }: { article: ListedArticle }) {
    return (
        <div className="article-listing">
            <h3>
                <SmartLink href={article.path}>{article.title}</SmartLink>
            </h3>
            {article.published && (
                <time dateTime={article.published}>
                    {new Date(article.published).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}
                </time>
            )}
            {article.description && <p>{article.description}</p>}
        </div>
    );
}

// Replaces the Gatsby article-listings components (LatestBlogs, LatestReact,
// …) and the pageQuery listings on collection pages. Pattern semantics match
// the old graphql regex filters; omit `pattern` for all blog articles, omit
// `limit` for the full list.
export async function LatestArticles({ pattern, limit }: { pattern?: string; limit?: number }) {
    const articles = await getArticlesByPattern(pattern ?? null, limit);

    return (
        <>
            {articles.map((article) => (
                <ArticleListing key={article.path} article={article} />
            ))}
        </>
    );
}

// Lists published pages under a path prefix, e.g. the interviews index.
export async function PageListing({ prefix }: { prefix: string }) {
    const pages = await getPagesUnder(prefix);

    return (
        <>
            {pages.map((page) => (
                <ArticleListing key={page.path} article={page} />
            ))}
        </>
    );
}
