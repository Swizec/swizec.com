import { SmartLink } from './link';

export function SiteHeader() {
    return (
        <header className="site-header">
            <div className="site-header-inner">
                <SmartLink className="site-logo" href="/">
                    Swizec Teller
                    <span className="site-logo-sub">software engineering lessons from production</span>
                </SmartLink>
                <nav aria-label="Main">
                    <SmartLink href="/blog">Blog</SmartLink>
                    <SmartLink href="/books">Books</SmartLink>
                    <SmartLink href="/about">About</SmartLink>
                    <SmartLink className="site-header-cta" href="/letters">
                        Get the newsletter 💌
                    </SmartLink>
                </nav>
            </div>
        </header>
    );
}
