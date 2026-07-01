import { allPages } from 'content-collections';

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

function mdToHtmlInline(text: string): string {
    return text
        // Join soft-wrapped lines into a single line
        .replace(/\n/g, ' ')
        // Escape bare ampersands
        .replace(/&(?![a-zA-Z#\d]+;)/g, '&amp;')
        // Remove images
        .replace(/!\[([^\]]*)\]\([^)]*\)/g, '')
        // Inline code (before other patterns to avoid false positives)
        .replace(/`([^`\n]+)`/g, '<code>$1</code>')
        // Links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
        // Bold+italic
        .replace(/\*{3}([^*\n]+)\*{3}/g, '<strong><em>$1</em></strong>')
        .replace(/_{3}([^_\n]+)_{3}/g, '<strong><em>$1</em></strong>')
        // Bold
        .replace(/\*{2}([^*\n]+)\*{2}/g, '<strong>$1</strong>')
        .replace(/_{2}([^_\n]+)_{2}/g, '<strong>$1</strong>')
        // Italic (avoid mangling snake_case)
        .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
        .replace(/(?<![a-zA-Z0-9])_([^_\n]+)_(?![a-zA-Z0-9])/g, '<em>$1</em>')
        // Strikethrough
        .replace(/~~([^~\n]+)~~/g, '<del>$1</del>');
}

function extractHtmlParagraphs(content: string, articleUrl: string, count = 3): string {
    // Strip fenced code blocks so fence delimiters don't bleed into the excerpt
    const withoutCode = content.replace(/```[\s\S]*?```/g, '');
    const paragraphs = withoutCode.split(/\n\n+/);
    const result: string[] = [];

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

        result.push(`<p>${mdToHtmlInline(trimmed)}</p>`);
        if (result.length >= count) break;
    }

    result.push(`<p><a href="${articleUrl}">Continue reading →</a></p>`);
    return result.join('\n');
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

    const items = publishedPages.map((page) => {
        const url = pageUrl(page._meta.path);
        const pubDate = new Date(page.published!).toUTCString();
        const description = extractHtmlParagraphs(page.content, url);

        return `    <item>
      <title>${escapeXml(page.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>${page.description ? `\n      <description>${escapeXml(page.description)}</description>` : ''}
      <content:encoded><![CDATA[${escapeCdata(description)}]]></content:encoded>
    </item>`;
    });

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
