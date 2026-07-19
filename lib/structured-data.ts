// JSON-LD builders for Google rich results, limited to the search-gallery
// types that actually render for a personal engineering blog:
//  - BlogPosting on articles — headline/image/date rich treatment
//  - WebSite on the homepage — controls the site name shown in results
//  - ProfilePage on /about — author identity signals
//  - BreadcrumbList where a real navigable hierarchy exists
// Deliberately absent: sitelinks search box (retired by Google), FAQ
// (restricted to gov/health sites), Product on book pages (sales happen on
// external sites, so offer markup here would be ignored or flagged).

export const SITE_URL = 'https://swizec.com';

const PERSON = {
    '@type': 'Person',
    name: 'Swizec Teller',
    url: `${SITE_URL}/about`,
    sameAs: ['https://twitter.com/swizec', 'https://github.com/swizec'],
};

export function personJsonLd(image?: string) {
    return {
        '@context': 'https://schema.org',
        ...PERSON,
        ...(image && { image }),
        description:
            'Swizec shares software engineering lessons from production in his books, articles, talks, and workshops',
    };
}

export function webSiteJsonLd() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Swizec Teller',
        alternateName: 'swizec.com',
        url: SITE_URL,
    };
}

export function profilePageJsonLd(image?: string) {
    return {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        mainEntity: {
            ...PERSON,
            ...(image && { image }),
            description:
                'Swizec shares software engineering lessons from production in his books, articles, talks, and workshops',
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
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: title,
        ...(description && { description }),
        ...(image && { image: [image] }),
        ...(datePublished && { datePublished }),
        url,
        mainEntityOfPage: url,
        author: PERSON,
        publisher: PERSON,
    };
}

// Last crumb (the current page) carries no URL, per Google's examples.
export function breadcrumbsJsonLd(items: Array<{ name: string; url?: string }>) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, position) => ({
            '@type': 'ListItem',
            position: position + 1,
            name: item.name,
            ...(item.url && { item: item.url }),
        })),
    };
}
