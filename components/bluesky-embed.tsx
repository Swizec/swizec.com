type BskyOEmbed = {
  html?: unknown;
};

const bskyHtmlCache = new Map<string, Promise<string | null>>();

async function fetchBskyHtml(url: string): Promise<string | null> {
  const oembedUrl = new URL('https://embed.bsky.app/oembed');
  oembedUrl.searchParams.set('url', url);

  try {
    const response = await fetch(oembedUrl);
    if (!response.ok) return null;

    const data = (await response.json()) as BskyOEmbed;
    if (typeof data.html !== 'string') return null;
    // Strip inline script tags — we load embed.js separately via BlueskyEmbedScript
    return data.html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').trim();
  } catch {
    return null;
  }
}

function bskyHtml(url: string) {
  const cached = bskyHtmlCache.get(url);
  if (cached) return cached;

  const promise = fetchBskyHtml(url);
  bskyHtmlCache.set(url, promise);
  return promise;
}

export async function BlueskyEmbed({ url }: { url: string }) {
  const html = await bskyHtml(url);

  return (
    <div className="swizec-embed swizec-embed-bsky">
      {html ? (
        <div dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <blockquote>
          <p>
            <a href={url}>{url}</a>
          </p>
        </blockquote>
      )}
    </div>
  );
}
