import type { Metadata } from '@timber-js/app/server';
import HomeContent from '../pages/index.mdx';

export const metadata: Metadata = {
    title: 'Swizec Teller - a geek with a hat',
    description:
        'I write emails with real insight into the career and skills of a modern software engineer. Raw and honest from the heart, fueled by lessons learned over 20 years of building production code.',
};

export default function Home() {
    return (
        <main>
            <HomeContent />
        </main>
    );
}
