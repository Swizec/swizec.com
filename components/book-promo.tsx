import { LATEST_BOOKS, bookForUpgrade, type Book } from '../lib/books';
import { BOOK_COVERS } from './book-covers';
import { SmartLink } from './link';

function PromoCard({ book }: { book: Book }) {
    return (
        <SmartLink className="book-promo-card" href={book.href}>
            <img src={BOOK_COVERS[book.cover]} alt={`${book.title} book cover`} loading="lazy" />
            <div>
                <strong>{book.title}</strong>
                <p>{book.tagline}</p>
                <span className="book-promo-cta">Check it out 👉</span>
            </div>
        </SmartLink>
    );
}

// End-of-article book plug: the book tied to the article's content upgrade,
// or the latest two when nothing is tied.
export function BookPromo({ upgradeKey }: { upgradeKey?: string }) {
    const tiedBook = bookForUpgrade(upgradeKey);
    const books = tiedBook ? [tiedBook] : LATEST_BOOKS;

    return (
        <section className="book-promo" aria-label="Books by Swizec">
            <h2>{tiedBook ? 'Liked this article? You’ll love the book' : 'Dive deeper with my books'}</h2>
            <div className="book-promo-grid">
                {books.map((book) => (
                    <PromoCard key={book.slug} book={book} />
                ))}
            </div>
        </section>
    );
}
