import { allPages } from 'content-collections';
import { getSegmentParams } from '@timber-js/app/server';
import { LATEST_BOOKS, bookForUpgrade, type Book } from '../lib/books';
import { COVER_WIDTHS, optimizedUrl, optimizedSrcSet } from '../lib/image-sizes.mjs';
import { BOOK_COVERS } from './book-covers';
import { SmartLink } from './link';

function currentPageUpgrade(): string | undefined {
    const { slug } = getSegmentParams();
    if (!slug) return undefined;
    const path = Array.isArray(slug) ? slug.join('/') : slug;
    const page = allPages.find((p) => p._meta.path === path || p._meta.path === `${path}/index`);
    return page?.content_upgrade;
}

function SidebarBook({ book }: { book: Book }) {
    return (
        <SmartLink className="book-sidebar-book" href={book.href} plausibleEvent={book.bannerEvent}>
            {/* Cover sources are multi-MB originals; serve small optimized
                variants — renders ≤220px tall, so 320w/640w cover 1x/2x */}
            <img
                src={optimizedUrl(BOOK_COVERS[book.cover], 320)}
                srcSet={optimizedSrcSet(BOOK_COVERS[book.cover], COVER_WIDTHS)}
                sizes="220px"
                alt={`${book.title} book cover`}
                loading="lazy"
                decoding="async"
            />
            <strong>{book.title}</strong>
            <span>{book.tagline}</span>
        </SmartLink>
    );
}

// Site-wide book rail. Shows the latest two books; on pages whose
// content_upgrade ties to a specific book, shows just that book.
export function BookSidebar() {
    const tiedBook = bookForUpgrade(currentPageUpgrade());
    const books = tiedBook ? [tiedBook] : LATEST_BOOKS;

    return (
        <aside className="book-sidebar" aria-label="Books by Swizec">
            <h2>{tiedBook ? 'Read the book' : 'Books by Swizec'}</h2>
            {books.map((book) => (
                <SidebarBook key={book.slug} book={book} />
            ))}
        </aside>
    );
}
