// Replaces the Gatsby theme's <Typeform /> — plain iframe embed, no SDK.
export function Typeform({ url }: { url: string }) {
    return (
        <iframe
            src={url}
            className="typeform-embed"
            title="Survey"
            allow="camera; microphone; autoplay; encrypted-media"
        />
    );
}
