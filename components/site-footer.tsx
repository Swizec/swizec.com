import { SmartLink } from './link';

export function SiteFooter() {
    return (
        <footer className="site-footer">
            <div className="site-footer-inner">
                <div className="site-footer-cols">
                    <div>
                        <h2>Read</h2>
                        <nav aria-label="Content">
                            <SmartLink href="/blog">Latest articles</SmartLink>
                            <SmartLink href="/categories">Categories</SmartLink>
                            <SmartLink href="/interviews">Interviews</SmartLink>
                            <SmartLink href="/talks">Talks</SmartLink>
                            {/* RSS is an XML endpoint, not an RSC route — keep a full load */}
                            <a href="/rss.xml">RSS feed</a>
                        </nav>
                    </div>
                    <div>
                        <h2>Books & courses</h2>
                        <nav aria-label="Books and courses">
                            <SmartLink href="https://scalingfastbook.com">Scaling Fast</SmartLink>
                            <SmartLink href="/senior-mindset">Senior Engineer Mindset</SmartLink>
                            <SmartLink href="https://serverlesshandbook.dev">Serverless Handbook</SmartLink>
                            <SmartLink href="/books">All books</SmartLink>
                            <SmartLink href="/courses">Courses</SmartLink>
                            <SmartLink href="/workshops">Workshops</SmartLink>
                        </nav>
                    </div>
                    <div>
                        <h2>Top categories</h2>
                        <nav aria-label="Top categories">
                            <SmartLink href="/categories/senior-mindset">Senior Mindset</SmartLink>
                            <SmartLink href="/categories/frontend">Frontend</SmartLink>
                            <SmartLink href="/categories/backend">Backend</SmartLink>
                            <SmartLink href="/categories/ai">AI</SmartLink>
                            <SmartLink href="/categories/leadership">Leadership</SmartLink>
                            <SmartLink href="/categories/career">Career</SmartLink>
                        </nav>
                    </div>
                    <div>
                        <h2>About</h2>
                        <nav aria-label="Meta">
                            <SmartLink href="/about">About Swizec</SmartLink>
                            <SmartLink href="/testimonials">Testimonials</SmartLink>
                            <SmartLink href="/letters">Newsletter</SmartLink>
                            <SmartLink href="https://twitter.com/swizec">Twitter</SmartLink>
                            <SmartLink href="https://bsky.app/profile/swizec.com">Bluesky</SmartLink>
                            <SmartLink href="https://github.com/swizec">GitHub</SmartLink>
                            <SmartLink href="https://www.youtube.com/@SwizecTeller">YouTube</SmartLink>
                            <SmartLink href="/privacy">Privacy policy</SmartLink>
                        </nav>
                    </div>
                </div>
                <p className="site-footer-note">
                    Made with ❤️ by <SmartLink href="/about">Swizec Teller</SmartLink> · ©{' '}
                    {new Date().getFullYear()} Swizec LLC ·{' '}
                    <SmartLink href="mailto:hi@swizec.com">hi@swizec.com</SmartLink>
                </p>
            </div>
        </footer>
    );
}
