type TweetOEmbed = {
  html?: unknown;
};

const tweetHtmlCache = new Map<string, Promise<string | null>>();

async function fetchTweetHtml(url: string): Promise<string | null> {
  const oembedUrl = new URL('https://publish.twitter.com/oembed');
  oembedUrl.searchParams.set('url', url);
  oembedUrl.searchParams.set('omit_script', 'true');
  oembedUrl.searchParams.set('dnt', 'true');

  try {
    const response = await fetch(oembedUrl);
    if (!response.ok) return null;

    const data = (await response.json()) as TweetOEmbed;
    return typeof data.html === 'string' ? data.html : null;
  } catch {
    return null;
  }
}

function tweetHtml(url: string) {
  const cached = tweetHtmlCache.get(url);
  if (cached) return cached;

  const promise = fetchTweetHtml(url);
  tweetHtmlCache.set(url, promise);
  return promise;
}

export async function TweetEmbed({ url }: { url: string }) {
  const html = await tweetHtml(url);

  return (
    <div className="swizec-embed swizec-embed-tweet">
      {html ? (
        <div dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <blockquote className="twitter-tweet" data-dnt="true">
          <p>
            <a href={url}>{url}</a>
          </p>
        </blockquote>
      )}
    </div>
  );
}
