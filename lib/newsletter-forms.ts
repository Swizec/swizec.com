export interface NewsletterForm {
    formId: string;
    headline: string;
    description: string;
    submitText: string;
}

// Kit (ConvertKit) form IDs live on the Kit side and each one triggers its
// own automation — don't change them. IDs match gatsby-config.js on master.
export const DEFAULT_FORM: NewsletterForm = {
    formId: '826419',
    headline: 'Learned something new? Read more Software Engineering Lessons from Production',
    description:
        'I write articles with real insight into the career and skills of a modern software engineer. "Raw and honest from the heart!" as one reader described them. Fueled by lessons learned over 20 years of building production code for side-projects, small businesses, and hyper growth startups. Both successful and not.',
    submitText: 'Subscribe 💌',
};

// Keyed by lowercased content_upgrade frontmatter value. Lookup is
// case-insensitive because frontmatter spells these inconsistently
// (Javascript vs JavaScript, FullstackWeb vs fullstackWeb).
const FORMS: Record<string, NewsletterForm> = {
    seniormindset: {
        formId: '1712642',
        headline: 'The Senior Engineer Mindset email crash course',
        description:
            'Get promoted, earn a bigger salary, work for top companies. A new take on being a senior engineer, straight to your inbox.',
        submitText: 'Get email crash course 💌',
    },
    scalingfast: {
        formId: '8571155',
        headline: 'Scaling Fast — free chapter',
        description:
            'Curious how great teams ship fast without burning out? Get a free chapter of Scaling Fast, my book on engineering leadership at hypergrowth startups.',
        submitText: 'Send it to me! 💌',
    },
    serverlesshandbook: {
        formId: '2103715',
        headline: 'Serverless Handbook — free chapter',
        description:
            'Dip your toes in backend web development with a free chapter of the Serverless Handbook, written for frontend engineers.',
        submitText: 'Send it to me! 💌',
    },
    reactcu: {
        formId: '2753675',
        headline: 'Get Curated React Essays',
        description: 'The best React essays, curated and sent straight to your inbox.',
        submitText: 'Send them to me! 💌',
    },
    javascript: {
        formId: '2507452',
        headline: 'Get Curated JavaScript Essays',
        description: 'The best JavaScript essays, curated and sent straight to your inbox.',
        submitText: 'Send them to me! 💌',
    },
    fullstackweb: {
        formId: '2507619',
        headline: 'Get Curated Fullstack Web Essays',
        description: 'Real insight into modern fullstack web development, straight to your inbox.',
        submitText: 'Send them to me! 💌',
    },
    serverless: {
        formId: '2849380',
        headline: 'Get Curated Serverless Essays',
        description: 'The best serverless and backend engineering essays, curated for your inbox.',
        submitText: 'Send them to me! 💌',
    },
    indiehacking: {
        formId: '2753667',
        headline: 'Get Curated Indie Hacking Essays',
        description: 'The best indie hacking and side-business essays, curated for your inbox.',
        submitText: 'Send them to me! 💌',
    },
    computerscience: {
        formId: '2720965',
        headline: 'Get Curated Computer Science Essays',
        description: 'Computer science fundamentals applied to everyday software engineering, in your inbox.',
        submitText: 'Send them to me! 💌',
    },
};

export function getNewsletterForm(key: string | null | undefined): NewsletterForm {
    if (!key) return DEFAULT_FORM;
    // Strip accidental quotes from frontmatter, normalize casing
    const normalized = key.trim().replace(/^"|"$/g, '').toLowerCase();
    if (!normalized) return DEFAULT_FORM;
    return FORMS[normalized] ?? DEFAULT_FORM;
}
