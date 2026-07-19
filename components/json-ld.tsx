// Renders a JSON-LD structured data block. Google reads these anywhere in
// the document, so pages render them inline where used — no head management.
// `<` is escaped so content strings can never close the script tag.
export function JsonLd({ data }: { data: object }) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
        />
    );
}
