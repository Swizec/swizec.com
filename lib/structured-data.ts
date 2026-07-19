// JSON-LD builders for Google rich results, limited to the search-gallery
// types that actually render for a personal engineering blog:
//  - BlogPosting on articles — headline/image/date rich treatment
//  - WebSite on the homepage — controls the site name shown in results
//  - ProfilePage on /about — author identity signals
//  - BreadcrumbList where a real navigable hierarchy exists
// Deliberately absent: sitelinks search box (retired by Google), FAQ
// (restricted to gov/health sites), Product on book pages (sales happen on
// external sites, so offer markup here would be ignored or flagged).
//
// Typed with schema-dts (Google's schema.org typings) and rendered with
// react-schemaorg's <JsonLd item={...}> at call sites, which owns the
// XSS-safe serialization. Undefined fields drop out in JSON.stringify.
import type {
    BlogPosting,
    BreadcrumbList,
    Person,
    ProfilePage,
    WebSite,
    WithContext,
} from 'schema-dts';

export const SITE_URL = 'https://swizec.com';

const PERSON = {
    '@type': 'Person',
    name: 'Swizec Teller',
    url: `${SITE_URL}/about`,
    sameAs: ['https://twitter.com/swizec', 'https://github.com/swizec'],
} satisfies Person;

const AUTHOR_BLURB =
    'Swizec shares software engineering lessons from production in his books, articles, talks, and workshops';

export function personJsonLd(image?: string): WithContext<Person> {
    return {
        '@context': 'https://schema.org',
        ...PERSON,
        image,
        description: AUTHOR_BLURB,
    };
}

export function webSiteJsonLd(): WithContext<WebSite> {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Swizec Teller',
        alternateName: 'swizec.com',
        url: SITE_URL,
    };
}

export function profilePageJsonLd(image?: string): WithContext<ProfilePage> {
    return {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        mainEntity: {
            ...PERSON,
            image,
            description: AUTHOR_BLURB,
        },
    };
}

export function blogPostingJsonLd({
    title,
    description,
    url,
    image,
    datePublished,
}: {
    title: string;
    description?: string;
    url: string;
    image?: string;
    datePublished?: string;
}): WithContext<BlogPosting> {
    return {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: title,
        description: description || undefined,
        image: image ? [image] : undefined,
        datePublished,
        url,
        mainEntityOfPage: url,
        author: PERSON,
        publisher: PERSON,
    };
}

// Last crumb (the current page) carries no URL, per Google's examples.
export function breadcrumbsJsonLd(
    items: Array<{ name: string; url?: string }>,
): WithContext<BreadcrumbList> {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, position) => ({
            '@type': 'ListItem' as const,
            position: position + 1,
            name: item.name,
            item: item.url,
        })),
    };
}
