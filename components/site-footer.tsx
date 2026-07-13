export function SiteFooter() {
    return (
        <footer className="site-footer">
            <div className="site-footer-inner">
                <div className="site-footer-cols">
                    <div>
                        <h2>Read</h2>
                        <nav aria-label="Content">
                            <a href="/blog">Latest articles</a>
                            <a href="/categories">Categories</a>
                            <a href="/collections">Curated collections</a>
                            <a href="/interviews">Interviews</a>
                            <a href="/talks">Talks</a>
                            <a href="/rss.xml">RSS feed</a>
                        </nav>
                    </div>
                    <div>
                        <h2>Books & courses</h2>
                        <nav aria-label="Books and courses">
                            <a href="https://scalingfastbook.com">Scaling Fast</a>
                            <a href="/senior-mindset">Senior Engineer Mindset</a>
                            <a href="https://serverlesshandbook.dev">Serverless Handbook</a>
                            <a href="/books">All books</a>
                            <a href="/courses">Courses</a>
                            <a href="/workshops">Workshops</a>
                        </nav>
                    </div>
                    <div>
                        <h2>Collections</h2>
                        <nav aria-label="Collections">
                            <a href="/collections/seniormindset">Senior Mindset</a>
                            <a href="/collections/react">React</a>
                            <a href="/collections/javascript">JavaScript</a>
                            <a href="/collections/serverless">Serverless & Backend</a>
                            <a href="/collections/indie-hacking">Indie Hacking</a>
                            <a href="/collections/fullstack-web">Fullstack Web</a>
                        </nav>
                    </div>
                    <div>
                        <h2>About</h2>
                        <nav aria-label="Meta">
                            <a href="/about">About Swizec</a>
                            <a href="/testimonials">Testimonials</a>
                            <a href="/letters">Newsletter</a>
                            <a href="https://twitter.com/swizec">Twitter</a>
                            <a href="https://github.com/swizec">GitHub</a>
                            <a href="https://youtube.com/swizecteller">YouTube</a>
                            <a href="/privacy">Privacy policy</a>
                        </nav>
                    </div>
                </div>
                <p className="site-footer-note">
                    Made with ❤️ by <a href="/about">Swizec Teller</a> · © {new Date().getFullYear()}{' '}
                    Swizec LLC · <a href="mailto:hi@swizec.com">hi@swizec.com</a>
                </p>
            </div>
        </footer>
    );
}
