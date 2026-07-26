// Posts older than 10 years get a heads-up that the content may be stale.
// Age is computed at render (build) time from the publish date.
export function OldPostNote({ published }: { published?: string }) {
    if (!published) return null;

    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 10);
    const publishedDate = new Date(published);
    if (Number.isNaN(publishedDate.valueOf()) || publishedDate > cutoff) {
        return null;
    }

    return (
        <p className="old-post-note">
            Hi 👋 you&apos;re reading a pretty old post! I started writing on
            here back in high school and this page may not reflect my current
            views. Recommend checking out related articles and categories down
            below, I&apos;ve likely published more recent thoughts on this
            topic.
        </p>
    );
}
