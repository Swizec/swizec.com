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

function extractTextParagraphs(content: string, count = 3): string {
    // Strip fenced code blocks before splitting into paragraphs so code
    // fence delimiters and body lines don't bleed into the excerpt
    const withoutCode = content.replace(/```[\s\S]*?```/g, '');
    const paragraphs = withoutCode.split(/\n\n+/);
    const result: string[] = [];

    for (const raw of paragraphs) {
        const trimmed = raw.trim();
        if (!trimmed) continue;

        // Skip headings, images, HTML blocks, blockquotes, remaining fence lines
        if (
            trimmed.startsWith('#') ||
            trimmed.startsWith('!') ||
            trimmed.startsWith('<') ||
            trimmed.startsWith('>') ||
            trimmed.startsWith('```')
        ) {
            continue;
        }

        // Strip markdown syntax
        const stripped = trimmed
            // Remove images: ![alt](url)
            .replace(/!\[([^\]]*)\]\([^)]*\)/g, '')
            // Links: [label](url) → label
            .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
            // Bold+italic: ***text*** or ___text___
            .replace(/\*{3}([^*]+)\*{3}/g, '$1')
            .replace(/_{3}([^_]+)_{3}/g, '$1')
            // Bold: **text** or __text__
            .replace(/\*{2}([^*]+)\*{2}/g, '$1')
            .replace(/_{2}([^_]+)_{2}/g, '$1')
            // Italic: *text* or _text_ — only when not surrounded by word chars
            // to avoid mangling snake_case identifiers
            .replace(/\*([^*\n]+)\*/g, '$1')
            .replace(/(?<![a-zA-Z0-9])_([^_\n]+)_(?![a-zA-Z0-9])/g, '$1')
            // Inline code: `text`
            .replace(/`([^`]+)`/g, '$1')
            // Strikethrough: ~~text~~
            .replace(/~~([^~]+)~~/g, '$1')
            // Remove list markers
            .replace(/^\s*[-*+]\s+/gm, '')
            .replace(/^\s*\d+\.\s+/gm, '')
            .trim();

        if (stripped.length > 0) {
            result.push(stripped);
        }

        if (result.length >= count) break;
    }

    return result.join('\n\n');
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
        const description = extractTextParagraphs(page.content);

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
