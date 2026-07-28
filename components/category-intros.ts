// Blurb + newsletter funnel for the core categories highlighted on the
// homepage and in the footer. Categories without an entry render the
// plain listing. Form keys resolve via lib/newsletter-forms.ts.
export interface CategoryIntro {
    blurb: string;
    formKey?: string;
}

export const CATEGORY_INTROS: Record<string, CategoryIntro> = {
    'senior-mindset': {
        blurb: 'Getting that senior title is easy. Just stick around. Being a true senior takes a new way of thinking — these essays teach you how.',
        formKey: 'SeniorMindset',
    },
    ai: {
        blurb: "AI writes most of my code these days. The hard part was never the typing — it's knowing what to build and recognizing when the machine is wrong. Lessons from using AI in production, not demos.",
    },
    frontend: {
        blurb: 'The frontend is where your code meets real people. Lessons from 20 years of building UIs people actually use — React, dataviz, and the browser platform.',
    },
    backend: {
        blurb: "I've been building web backends since ~2004 when they were just called websites. Serverless, databases, APIs, and the ops that keep them alive.",
        formKey: 'ServerlessHandbook',
    },
    javascript: {
        blurb: "I took a bet on JavaScript in 2005 when it was known as DHTML. It's been my favorite language ever since. Since 2019, I'm full into TypeScript — the perfect balance between flexibility and correctness.",
    },
    react: {
        blurb: 'React is here to stay. It solves many problems you may not even know existed. These essays are the good stuff I learned over the years — beyond the tutorial.',
    },
    leadership: {
        blurb: 'Teams, mentoring, feedback, hiring — the people skills that turn a strong engineer into a force multiplier. No MBA required.',
        formKey: 'SeniorMindset',
    },
    'side-project': {
        blurb: 'Side projects are how I learn new things, and sometimes how I earn. Essays on building things on the side — and occasionally getting paid for it.',
    },
};
