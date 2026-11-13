import type { Metadata } from '@timber-js/app/server';
import HomeContent from '../pages/index.mdx';
import { BookSidebar } from '../components/book-sidebar';
import { requestOrigin } from './mdx-metadata';
import { JsonLd } from 'react-schemaorg';
import { SITE_URL, webSiteJsonLd, personJsonLd } from '../lib/structured-data';
import bylinePhoto from './assets/swizec-byline.jpg';

export async function metadata(): Promise<Metadata> {
    const ogImage = `${requestOrigin()}/opengraph-image.png`;
    return {
        title: 'Software engineering lessons from production',
        description:
            'Build the judgment to ship software, lead teams, and take on bigger problems. Lessons from two decades of building, rewriting, and teaching software.',
        openGraph: {
            title: 'Software engineering lessons from production',
            description: 'Build the judgment to ship software, lead teams, and take on bigger problems. Lessons from two decades of building, rewriting, and teaching software.',
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
        <>
            {/* Site-name + author identity markup; Google reads both from the
                homepage only. */}
            <JsonLd item={webSiteJsonLd()} />
            <JsonLd item={personJsonLd(`${SITE_URL}${bylinePhoto}`)} />
            <main>
                <HomeContent />
            </main>
            <BookSidebar />
        </>
    );
}
