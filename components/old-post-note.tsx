import { isValid, parseISO, subYears } from 'date-fns';

// Posts older than 10 years get a heads-up that the content may be stale.
// Age is computed at render (build) time from the publish date.
export function OldPostNote({ published }: { published?: string }) {
    if (!published) return null;

    const publishedDate = parseISO(published);
    if (!isValid(publishedDate) || publishedDate > subYears(new Date(), 10)) {
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
