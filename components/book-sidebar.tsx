import { allPages } from 'content-collections';
import { getSegmentParams } from '@timber-js/app/server';
import { LATEST_BOOKS, bookForUpgrade, type Book } from '../lib/books';
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
        <SmartLink className="book-sidebar-book" href={book.href}>
            <img src={BOOK_COVERS[book.cover]} alt={`${book.title} book cover`} loading="lazy" />
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
