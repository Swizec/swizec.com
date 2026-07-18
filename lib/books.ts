export interface Book {
    slug: string;
    title: string;
    tagline: string;
    href: string;
    /** import path handled by components; key ties content_upgrade values to a book */
    cover: 'scaling-fast' | 'senior-mindset' | 'serverless-handbook';
}

export const BOOKS: Record<string, Book> = {
    'scaling-fast': {
        slug: 'scaling-fast',
        title: 'Scaling Fast',
        tagline: "The engineer's playbook for hypergrowth startups",
        href: 'https://scalingfastbook.com',
        cover: 'scaling-fast',
    },
    'senior-mindset': {
        slug: 'senior-mindset',
        title: 'Senior Engineer Mindset',
        tagline: 'Get promoted, earn a bigger salary, work for top companies',
        href: '/senior-mindset',
        cover: 'senior-mindset',
    },
    'serverless-handbook': {
        slug: 'serverless-handbook',
        title: 'Serverless Handbook',
        tagline: 'Modern backend for frontend engineers',
        href: 'https://serverlesshandbook.dev',
        cover: 'serverless-handbook',
    },
};

// The latest two books, shown in the sidebar by default.
export const LATEST_BOOKS: Book[] = [BOOKS['scaling-fast'], BOOKS['senior-mindset']];

// content_upgrade frontmatter values that tie an article to a specific book.
const UPGRADE_TO_BOOK: Record<string, string> = {
    scalingfast: 'scaling-fast',
    seniormindset: 'senior-mindset',
    serverlesshandbook: 'serverless-handbook',
    serverless: 'serverless-handbook',
};

export function bookForUpgrade(upgradeKey: string | null | undefined): Book | undefined {
    if (!upgradeKey) return undefined;
    const slug = UPGRADE_TO_BOOK[upgradeKey.trim().replace(/^"|"$/g, '').toLowerCase()];
    return slug ? BOOKS[slug] : undefined;
}
