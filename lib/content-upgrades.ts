export interface ContentUpgrade {
    formId: string;
    headline: string;
    description: string;
    submitText: string;
}

// Maps frontmatter content_upgrade values to ConvertKit form IDs and copy.
// Form IDs are hardcoded on the ConvertKit side — don't change them.
export const CONTENT_UPGRADES: Record<string, ContentUpgrade> = {
    SeniorMindset: {
        formId: '1712642',
        headline: 'The Senior Mindset email crash course',
        description:
            'Get promoted, earn a bigger salary, work for top companies. Being a true senior takes a new way of thinking.',
        submitText: 'Get email crash course 💌',
    },
    ScalingFast: {
        formId: '8571155',
        headline: 'Scaling Fast – free book preview',
        description: 'Get a free preview chapter of the Scaling Fast book.',
        submitText: 'Send it to me! 💌',
    },
    ServerlessHandbook: {
        formId: '2103715',
        headline: 'Serverless Handbook – free chapter',
        description:
            'Frontend engineers: learn serverless and backend concepts with a free chapter of the Serverless Handbook.',
        submitText: 'Send it to me! 💌',
    },
    ReactCU: {
        formId: '2753675',
        headline: 'Get Curated React Essays',
        description: 'The best React essays, curated and sent straight to your inbox.',
        submitText: 'Send them to me! 💌',
    },
    // Handle both "Javascript" and "JavaScript" spellings from frontmatter
    Javascript: {
        formId: '2507452',
        headline: 'Curated JavaScript Essays',
        description: 'The best JavaScript essays, curated and sent straight to your inbox.',
        submitText: 'Send them to me! 💌',
    },
    JavaScript: {
        formId: '2507452',
        headline: 'Curated JavaScript Essays',
        description: 'The best JavaScript essays, curated and sent straight to your inbox.',
        submitText: 'Send them to me! 💌',
    },
    // Handle both casings from frontmatter
    FullstackWeb: {
        formId: '2507619',
        headline: 'Curated Fullstack Web Essays',
        description: 'Real insight into modern fullstack web development, straight to your inbox.',
        submitText: 'Send them to me! 💌',
    },
    fullstackWeb: {
        formId: '2507619',
        headline: 'Curated Fullstack Web Essays',
        description: 'Real insight into modern fullstack web development, straight to your inbox.',
        submitText: 'Send them to me! 💌',
    },
    Serverless: {
        formId: '2849380',
        headline: 'Curated Serverless & Backend Essays',
        description: 'The best serverless and backend engineering essays, curated for your inbox.',
        submitText: 'Send them to me! 💌',
    },
    IndieHacking: {
        formId: '2753667',
        headline: 'Get Curated Indie Hacking Essays',
        description: 'The best indie hacking and business essays, curated for your inbox.',
        submitText: 'Send them to me! 💌',
    },
};

export const DEFAULT_UPGRADE: ContentUpgrade = {
    formId: '826419',
    headline: 'Join the Newsletter',
    description:
        'Real insight into the career and skills of a modern software engineer — raw and honest from the heart.',
    submitText: 'Subscribe 💌',
};

export function getContentUpgrade(key: string | undefined): ContentUpgrade {
    if (!key) return DEFAULT_UPGRADE;
    const trimmed = key.trim().replace(/^"|"$/g, ''); // strip accidental quotes from frontmatter
    return CONTENT_UPGRADES[trimmed] ?? DEFAULT_UPGRADE;
}
