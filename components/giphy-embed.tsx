type GiphyImage = {
  url: string;
  width: string;
  height: string;
};

type GiphyResult = {
  id: string;
  title: string;
  images: {
    downsized: GiphyImage;
    original: GiphyImage;
  };
};

type GiphySearchResponse = {
  data: GiphyResult[];
};

const giphyCache = new Map<string, Promise<GiphyResult | null>>();

async function fetchGiphy(query: string): Promise<GiphyResult | null> {
  const apiKey = process.env.GIPHY_API_KEY;
  if (!apiKey) return null;

  const url = new URL('https://api.giphy.com/v1/gifs/search');
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('q', query);
  url.searchParams.set('limit', '1');

  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const { data } = (await response.json()) as GiphySearchResponse;
    return data[0] ?? null;
  } catch {
    return null;
  }
}

function cachedGiphy(query: string) {
  const cached = giphyCache.get(query);
  if (cached) return cached;

  const promise = fetchGiphy(query);
  giphyCache.set(query, promise);
  return promise;
}

type GiphyEmbedProps = {
  query: string;
};

export async function GiphyEmbed({ query }: GiphyEmbedProps) {
  const gif = await cachedGiphy(query);
  const searchHref = `https://giphy.com/search/${encodeURIComponent(query)}`;

  if (!gif) {
    return (
      <figure className="swizec-embed swizec-embed-giphy">
        <a href={searchHref}>Giphy: {query}</a>
      </figure>
    );
  }

  const { url, width, height } = gif.images.downsized;

  return (
    <figure className="swizec-embed swizec-embed-giphy">
      <a href={`https://giphy.com/gifs/${gif.id}`}>
        <img src={url} width={Number(width)} height={Number(height)} alt={gif.title} loading="lazy" />
      </a>
    </figure>
  );
}
