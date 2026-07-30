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
        blurb: "Coding got easy with AI but the engineering remains. You have to know what to build, recognize when the machine is wrong, and design systems that work at scale. Here I share lessons from using AI in production.",
    },
    frontend: {
        blurb: 'Lessons from 20 years of building UIs people actually use — React, dataviz, and the browser platform.',
    },
    backend: {
        blurb: "I've been building web backends since ~2004 when they were just called websites. With these essays I want to share the hard lessons learned about serverless, databases, APIs, and the ops that keep them alive.",
        formKey: 'ServerlessHandbook',
    },
    javascript: {
        blurb: "JavaScript has been my programming language of choice since 2005 when it was called DHTML. Since 2019, I'm full into TypeScript — the perfect balance between flexibility and correctness.",
    },
    react: {
        blurb: 'React is here to stay. It solves problems you may not even know existed. These essays are the good stuff I learned over the years.',
    },
    leadership: {
        blurb: 'Teams, mentoring, feedback, hiring — the people skills that turn a strong engineer into a force multiplier. No MBA required.',
        formKey: 'SeniorMindset',
    },
    'side-project': {
        blurb: 'Side projects are how I learn and sometimes how I earn. Essays on building on the side — and occasionally getting paid for it.',
        formKey: 'ScalingFast',
    },
};
