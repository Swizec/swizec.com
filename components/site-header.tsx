export function SiteHeader() {
    return (
        <header className="site-header">
            <div className="site-header-inner">
                <a className="site-logo" href="/">
                    Swizec Teller
                    <span className="site-logo-sub">software engineering lessons from production</span>
                </a>
                <nav aria-label="Main">
                    <a href="/blog">Blog</a>
                    <a href="/books">Books</a>
                    <a href="/about">About</a>
                    <a className="site-header-cta" href="/letters">
                        Get the newsletter 💌
                    </a>
                </nav>
            </div>
        </header>
    );
}
