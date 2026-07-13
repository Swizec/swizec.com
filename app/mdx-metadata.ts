import { getHeaders } from '@timber-js/app/server';
import type { Metadata } from '@timber-js/app/server';
import type { Page } from 'content-collections';

const siteUrl = 'https://swizec.com';

// The og:image URL must be fetchable from wherever the scraper found the
// page — on Vercel preview deploys that's the preview host, not swizec.com
// (which still serves the old site until launch). Canonical URLs stay on
// siteUrl; only fetched resources use the request origin.
export function requestOrigin(): string {
  try {
    const headers = getHeaders();
    const host = headers.get('x-forwarded-host') ?? headers.get('host');
    if (!host) return siteUrl;
    const proto = headers.get('x-forwarded-proto') ?? 'https';
    return `${proto}://${host}`;
  } catch {
    return siteUrl;
  }
}
const siteName = 'Swizec Teller';
const twitterHandle = '@swizec';
const authorName = 'Swizec Teller';

function dateValue(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const normalized = value.match(/[zZ]|[+-]\d{2}:?\d{2}$|\d{4}-\d{2}-\d{2}$/)
    ? value
    : value.replace(' ', 'T') + 'Z';
  const date = new Date(normalized);
  if (Number.isNaN(date.valueOf())) return undefined;
  return date.toISOString();
}

function absoluteUrl(path: string, routePath = '/'): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = new URL(siteUrl);
  if (path.startsWith('./') || path.startsWith('../')) {
    const routeBase = routePath.endsWith('/') ? routePath : `${routePath}/`;
    return new URL(path, new URL(routeBase, base)).toString();
  }
  return new URL(path.startsWith('/') ? path : `/${path}`, base).toString();
}

export function metadataFromFrontmatter(page: Page, routePath: string): Metadata {
  const { title, description, publishedAt, published } = page;
  const pageUrl = absoluteUrl(routePath);
  // Every page gets a generated Y2K card (title + description + photo).
  // Request-origin host so previews self-serve; no .png suffix so scrapers
  // that refuse to follow the 302 redirect get the image directly.
  const ogImage = `${requestOrigin()}${routePath.endsWith('/') ? routePath.slice(0, -1) : routePath}/opengraph-image`;
  const publishedTime = dateValue(publishedAt ?? published);

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    authors: [{ name: authorName, url: 'https://swizec.com' }],
    creator: authorName,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName,
      type: 'article',
      publishedTime,
      authors: [authorName],
      images: { url: ogImage, alt: title },
    },
    twitter: {
      card: 'summary_large_image',
      site: twitterHandle,
      creator: twitterHandle,
      title,
      description,
      images: { url: ogImage, alt: title },
    },
  };
}
