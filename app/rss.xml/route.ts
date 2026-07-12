import { allPages } from 'content-collections';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

const SITE_URL = 'https://swizec.com';
const FEED_TITLE = 'Swizec Teller';
const FEED_DESCRIPTION = 'A geek with a hat';
const FEED_URL = `${SITE_URL}/rss.xml`;

function escapeXml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function escapeCdata(str: string): string {
    // ]]> ends a CDATA section — split across two sections to neutralize it
    return str.replace(/]]>/g, ']]]]><![CDATA[>');
}

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
    const lastBuildDate =
        publishedPages.length > 0
            ? new Date(publishedPages[0].published!).toUTCString()
            : now.toUTCString();

    const items = await Promise.all(
        publishedPages.map(async (page) => {
            const url = pageUrl(page._meta.path);
            const pubDate = new Date(page.published!).toUTCString();
            const description = await renderExcerptHtml(page.content, url);

            return `    <item>
      <title>${escapeXml(page.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>${page.description ? `\n      <description>${escapeXml(page.description)}</description>` : ''}
      <content:encoded><![CDATA[${escapeCdata(description)}]]></content:encoded>
    </item>`;
        }),
    );

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(FEED_TITLE)}</title>
    <description>${escapeXml(FEED_DESCRIPTION)}</description>
    <link>${SITE_URL}</link>
    <atom:link href="${FEED_URL}" rel="self" type="application/rss+xml" />
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
${items.join('\n')}
  </channel>
</rss>`;

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/rss+xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
        },
    });
}
