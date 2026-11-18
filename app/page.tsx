import type { Metadata } from '@timber-js/app/server';
import HomeContent, { frontmatter } from '../pages/index.mdx';
import { BookSidebar } from '../components/book-sidebar';
import { requestOrigin } from './mdx-metadata';
import { JsonLd } from 'react-schemaorg';
import { SITE_URL, webSiteJsonLd, personJsonLd } from '../lib/structured-data';
import bylinePhoto from './assets/swizec-byline.jpg';

export async function metadata(): Promise<Metadata> {
    const ogImage = `${requestOrigin()}/opengraph-image.png`;
    const { title, description } = frontmatter;
    return {
        title,
        description,
        openGraph: {
            title,
            description,
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
