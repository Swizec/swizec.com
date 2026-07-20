import { allPages } from 'content-collections';
import { Feed } from 'feed';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

const SITE_URL = 'https://swizec.com';
const FEED_TITLE = 'Swizec Teller';
const FEED_DESCRIPTION = 'A geek with a hat';
const AUTHOR = { name: 'Swizec Teller', email: 'hi@swizec.com', link: SITE_URL };

// markdown → HTML via the same remark/rehype stack the site uses for MDX.
// allowDangerousHtml passes through any raw HTML already in the prose.
const markdownToHtml = unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true });

/**
 * Select the first `count` prose paragraphs of an article as a markdown
 * excerpt. Skips headings, images, raw-HTML/embed blocks, blockquotes,
 * code fences, and lists so the excerpt reads as plain prose.
 */
function extractExcerptMarkdown(content: string, count = 3): string {
    // Strip fenced code blocks so fence delimiters don't bleed into the excerpt
    const withoutCode = content.replace(/```[\s\S]*?```/g, '');
    const paragraphs = withoutCode.split(/\n\n+/);
    const selected: string[] = [];

    for (const raw of paragraphs) {
        const trimmed = raw.trim();
        if (!trimmed) continue;

        // Skip headings, images, HTML blocks, blockquotes, fence lines, and lists
        if (
            trimmed.startsWith('#') ||
            trimmed.startsWith('!') ||
            trimmed.startsWith('<') ||
            trimmed.startsWith('>') ||
            trimmed.startsWith('```') ||
            /^\s*[-*+\d]/.test(trimmed)
        ) {
            continue;
        }

        selected.push(trimmed);
        if (selected.length >= count) break;
    }

    return selected.join('\n\n');
}

async function renderExcerptHtml(content: string, articleUrl: string): Promise<string> {
    const excerpt = extractExcerptMarkdown(content);
    const html = String(await markdownToHtml.process(excerpt));
    return `${html}\n<p><a href="${articleUrl}">Continue reading →</a></p>`;
}

function pageUrl(path: string): string {
    return `${SITE_URL}/${path.replace(/\/index$/, '')}`;
}

export async function GET(): Promise<Response> {
    const now = new Date();
    const publishedPages = allPages
        .filter((page) => {
            if (!page.published) return false;
            return new Date(page.published) <= now;
        })
        .sort((a, b) => {
            const dateA = new Date(a.published!).getTime();
            const dateB = new Date(b.published!).getTime();
            return dateB - dateA;
        })
        .slice(0, 50);

    // Use the most recent article's date so the feed is stable between deploys
    const updated =
        publishedPages.length > 0 ? new Date(publishedPages[0].published!) : now;

    const feed = new Feed({
        title: FEED_TITLE,
        description: FEED_DESCRIPTION,
        id: SITE_URL,
        link: SITE_URL,
        language: 'en-us',
        copyright: `© ${now.getFullYear()} Swizec Teller`,
        updated,
        feedLinks: { rss: `${SITE_URL}/rss.xml` },
        author: AUTHOR,
    });

    // Render excerpts in parallel but keep the sorted order (Promise.all
    // preserves array order); addItem in a plain loop so the feed stays
    // newest-first regardless of which excerpt resolves first.
    const items = await Promise.all(
        publishedPages.map(async (page) => {
            const url = pageUrl(page._meta.path);
            return {
                title: page.title,
                url,
                date: new Date(page.published!),
                description: page.description || undefined,
                content: await renderExcerptHtml(page.content, url),
            };
        }),
    );

    for (const item of items) {
        feed.addItem({
            title: item.title,
            id: item.url,
            link: item.url,
            date: item.date,
            description: item.description,
            content: item.content,
            author: [AUTHOR],
        });
    }

    return new Response(feed.rss2(), {
        headers: {
            'Content-Type': 'application/rss+xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
        },
    });
}
