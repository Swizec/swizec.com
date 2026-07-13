import type { Metadata } from '@timber-js/app/server';
import HomeContent from '../pages/index.mdx';
import { requestOrigin } from './mdx-metadata';

export async function metadata(): Promise<Metadata> {
    const ogImage = `${requestOrigin()}/opengraph-image`;
    return {
        title: 'Swizec Teller - a geek with a hat',
        description:
            'I write emails with real insight into the career and skills of a modern software engineer. Raw and honest from the heart, fueled by lessons learned over 20 years of building production code.',
        openGraph: {
            title: 'Swizec Teller - a geek with a hat',
            description: 'Software engineering lessons from production',
            images: { url: ogImage, alt: 'swizec.com' },
        },
        twitter: {
            card: 'summary_large_image',
            site: '@swizec',
            images: { url: ogImage, alt: 'swizec.com' },
        },
    };
}

export default function Home() {
    return (
        <main>
            <HomeContent />
        </main>
    );
}
