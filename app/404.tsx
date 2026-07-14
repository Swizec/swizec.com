'use client';

// Status files are passed across the RSC boundary as fallbackComponent, so
// this must be a client component — content is inlined rather than imported
// from pages/404.mdx (whose giphy embed is a server component).
export default function NotFound() {
    return (
        <div className="page-grid page-grid-solo">
        <div className="page-content">
        <main>
            <h1>404 Not Found</h1>
            <p>Ooops! Looks like that page doesn't exist.</p>
            <p>
                Clicked a link? Please <a href="https://twitter.com/swizec">hit me up on twitter</a>{' '}
                and I'll try to fix it.
            </p>
            <p>
                Coming from an email I sent you? You may be here before the site was done building
                and deploying. Keep this tab open and come back in a few minutes.
            </p>
        </main>
        </div>
        </div>
    );
}
