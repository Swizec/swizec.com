import type { Metadata } from '@timber-js/app/server';
import type { Page } from 'content-collections';

const siteUrl = 'https://swizec.com';
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

function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[*+~.()[\]{}'"!?/:@,]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function socialCardUrl(title: string, imagePath: string): string {
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const extension = imagePath.split(/[?#]/)[0]?.split('.').pop() ?? 'png';
  return absoluteUrl(`/social-cards/${slugifyTitle(title)}.${extension}`);
}

export function metadataFromFrontmatter(page: Page, routePath: string): Metadata {
  const { title, description, hero, image, publishedAt, published } = page;
  const pageUrl = absoluteUrl(routePath);
  const heroImage = hero ?? image;
  const ogImage = heroImage
    ? socialCardUrl(title, heroImage)
    : absoluteUrl(`${routePath}/opengraph-image.png`);
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
      images: ogImage ? { url: ogImage, alt: title } : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      site: twitterHandle,
      creator: twitterHandle,
      title,
      description,
      images: ogImage ? { url: ogImage, alt: title } : undefined,
    },
  };
}
