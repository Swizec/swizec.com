import avatar from '../app/assets/swizec-byline.jpg';

export function Byline({ published }: { published?: string }) {
    return (
        <div className="byline">
            <img src={avatar} alt="Swizec Teller" width={44} height={44} />
            <div>
                <span className="byline-name">
                    <a href="/about" rel="author">
                        Swizec Teller
                    </a>
                </span>
                <span className="byline-meta">
                    {published ? (
                        <time dateTime={published}>
                            {new Date(published).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </time>
                    ) : (
                        'A geek with a hat'
                    )}
                </span>
            </div>
        </div>
    );
}
